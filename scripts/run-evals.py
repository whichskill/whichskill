#!/usr/bin/env python3
"""Run the eval suite against the skill as it stands in this repo.

What this measures, and what it does not:

  It measures ROUTING QUALITY. The skill's prose — SKILL.md plus both reference
  files — is composed into a system prompt alongside a fixed fixture catalogue,
  and the model is asked each eval prompt. Assertions then check the answer.

  It does NOT measure TRIGGERING. Whether the harness surfaces the skill from its
  frontmatter description is a different question, and one this harness cannot
  answer because it injects the skill rather than letting discovery happen.

  It does NOT fully isolate the CATALOGUE either, and this was measured rather
  than assumed. The fixture below is inlined as the skill's catalogue, but the
  agent underneath also sees the skills genuinely installed on the machine
  running it, and will route on those in preference — asked directly with a
  deliberately altered fixture, it answered "j'ai donc routé sur la liste de
  skills réellement chargée dans la session". So on a machine whose packs
  resemble the fixture, a green run proves less than it appears. Isolating this
  properly needs a machine with a different pack set.

The fixture is still hand-written rather than generated, for the reason that
holds regardless: no third party's skill descriptions are redistributed here to
make a test pass.

Usage:
    python3 scripts/run-evals.py            # all evals
    python3 scripts/run-evals.py --only 2   # one eval
    python3 scripts/run-evals.py --model claude-sonnet-5
"""

import argparse
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = re.compile(r"[→>]")


def compose_system_prompt() -> str:
    """The skill as an agent would see it, with the fixture standing in for the
    generated catalogue so the hard rule has something real to bind to."""
    parts = [
        ("SKILL.md", ROOT / "SKILL.md"),
        ("references/chains.md", ROOT / "references" / "chains.md"),
        ("references/arbitration.md", ROOT / "references" / "arbitration.md"),
        ("references/catalogue.md", ROOT / "evals" / "fixtures" / "catalogue.md"),
    ]
    out = [
        "You have the following skill available and must follow it exactly. "
        "Its reference files are inlined below under their real paths.\n"
    ]
    for label, path in parts:
        if not path.exists():
            sys.exit(f"missing {path.relative_to(ROOT)} — cannot compose the skill")
        out.append(f"\n===== {label} =====\n{path.read_text(encoding='utf-8')}")
    return "".join(out)


def ask(prompt: str, system: str, model: str | None) -> str:
    cmd = ["claude", "-p", prompt, "--append-system-prompt", system,
           "--allowedTools", ""]
    if model:
        cmd += ["--model", model]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        return f"__RUNNER_ERROR__ exit {r.returncode}: {r.stderr.strip()[:400]}"
    return r.stdout


HEADING = re.compile(r"^#{1,4}\s*the chain\b", re.I)


def chain_line(answer: str) -> str:
    """Assertions about what is or is not in the chain must look here and not at
    the whole answer, because the skill deliberately names what it excludes.

    Read the heading first, arrows second. A chain of one carries no arrow —
    SKILL.md calls that a valid answer and tells the model not to pad it — so an
    arrow-only reader scores the skill's best behaviour as a missing chain.
    """
    lines = answer.splitlines()
    for i, line in enumerate(lines):
        if HEADING.match(line.strip()):
            for nxt in lines[i + 1:]:
                if nxt.strip():
                    return nxt
    for line in lines:
        if ARROW.search(line) and "/" in line:
            return line
    return ""


def chain_steps(answer: str) -> list[str]:
    chain = chain_line(answer)
    return [s for s in ARROW.split(chain) if "/" in s]


def check(a: dict, answer: str) -> tuple[bool, str]:
    t, v = a["type"], a["value"]
    low, chain = answer.lower(), chain_line(answer).lower()

    if t == "contains":
        return v.lower() in low, f"{v!r} absent from the answer"
    if t == "contains_any":
        return any(x.lower() in low for x in v), f"none of {v} present"
    if t == "chain_contains":
        return v.lower() in chain, f"{v!r} not in the chain: {chain_line(answer) or '(no chain found)'}"
    if t == "chain_absent":
        return v.lower() not in chain, f"{v!r} should not be in the chain: {chain_line(answer)}"
    if t == "chain_max_steps":
        steps = chain_steps(answer)
        if not steps:
            # An empty chain must never satisfy a ceiling. Passing here would mean
            # a failure to find the chain reads as compliance.
            return False, "no chain found, so the step ceiling proves nothing"
        return len(steps) <= v, f"chain has {len(steps)} steps, max {v}: {chain_line(answer)}"
    if t == "chain_before":
        first, second = (x.lower() for x in v)
        if first not in chain:
            return False, f"{v[0]!r} not in the chain at all"
        if second not in chain:
            return True, ""  # second is optional; ordering only binds when both appear
        return chain.index(first) < chain.index(second), f"{v[0]!r} must come before {v[1]!r}: {chain_line(answer)}"
    return False, f"unknown assertion type {t!r}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, help="run a single eval by id")
    ap.add_argument("--model", help="model to run against")
    args = ap.parse_args()

    suite = json.loads((ROOT / "evals" / "evals.json").read_text(encoding="utf-8"))
    evals = [e for e in suite["evals"] if args.only is None or e["id"] == args.only]
    if not evals:
        sys.exit(f"no eval with id {args.only}")

    system = compose_system_prompt()
    failed = 0

    for e in evals:
        print(f"\n{'=' * 70}\n#{e['id']} {e['name']}\n{'=' * 70}")
        answer = ask(e["prompt"], system, args.model)
        if answer.startswith("__RUNNER_ERROR__"):
            print(f"  RUNNER ERROR — {answer}")
            failed += 1
            continue

        print(f"  chain: {chain_line(answer) or '(none found)'}\n")
        for a in e["assertions"]:
            ok, why = check(a, answer)
            print(f"  {'PASS' if ok else 'FAIL'}  {a['type']}: {a['value']}")
            if not ok:
                failed += 1
                print(f"        {why}")
                print(f"        why it matters: {a['why']}")

        (ROOT / "evals" / "last-run").mkdir(exist_ok=True)
        (ROOT / "evals" / "last-run" / f"{e['id']}-{e['name']}.md").write_text(answer, encoding="utf-8")

    total = sum(len(e["assertions"]) for e in evals)
    print(f"\n{'=' * 70}\n{total - failed}/{total} assertions passed across {len(evals)} evals")
    print("answers saved under evals/last-run/ (gitignored)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

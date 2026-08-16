# Arbitrating the duplicates

Four packs installed side by side means three debuggers, two TDDs, three code reviews, four ways to frame an idea. They do not do the same thing. Deciding is this router's main service: never hand back two competitors and leave the choice open.

## Debugging

`/investigate` (gstack) · `/diagnosing-bugs` (Matt Pocock) · `/superpowers:systematic-debugging`

- **`/investigate`** by default. It is the only one wired into the rest of gstack — it hands off naturally to `/freeze`, `/qa`, `/ship`.
- **`/diagnosing-bugs`** when the bug resists: intermittent, a regression between two states you believed healthy, or a first look that already failed. It refuses to theorise until a command goes red on *this* bug, then fixes with a regression test. Its post-mortem hands off to `/improve-codebase-architecture` when the real problem is a missing seam.
- **`superpowers:systematic-debugging`** only if the session is already running the superpowers method.

**None of the three** when the cause is already known. A report that gives you the file, the line and the mechanism has finished the diagnosis: go straight to the red test.

## Writing tested code first

`/tdd` (Matt Pocock) · `superpowers:test-driven-development`

- **`/tdd`** by default. It is the discipline for a diff you are about to write, and it needs nothing around it.
- **`superpowers:test-driven-development`** inside a superpowers chain (`superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans`), where the surrounding steps expect its vocabulary.

**Neither, next to `/implement`.** `/implement` drives test-first internally. Putting either of these on the same diff runs two disciplines against each other. Choose `/implement`, or choose `/tdd` and drive the diff yourself.

## Reviewing code

`/code-review` (Matt Pocock) · `/review` (gstack) · `superpowers:requesting-code-review` · `/codex`

Contested ground — the catalogue's overlap detector flags it, and rightly. What separates them is the moment, not the quality, so the decision is *when*. It is still a decision.

- **`/review`** if you run only one. The pre-landing pass on the branch's full diff, and the one whose absence you notice.
- **`/code-review`** at the end of each ticket. Two axes: does the code follow the repo's documented standards, and does it do what the issue asked.
- **`superpowers:requesting-code-review`** when you want an independent subagent to verify the work answers the request.
- **`/codex`** in addition, not instead, when the stakes justify a second model on the same diff.

## Framing an idea

`/office-hours` · `/spec` (gstack) · `/grill-with-docs` · `/grill-me` · `/wayfinder` · `superpowers:brainstorming`

- **`/office-hours`** when the question is "is this worth building".
- **`/grill-with-docs`** when it is "what exactly does this mean". Stateful: it leaves a `CONTEXT.md` and ADRs behind. With no working directory, `/grill-me` runs the same interview without the trace.
- **`superpowers:brainstorming`** for the design-doc version, validated section by section.
- **`/spec`** when the answer is already known and has to be made executable — that is drafting, not exploration.
- **`/wayfinder`** only when the path is not visible and the effort exceeds one session. Slow and dense: never for a well-framed feature.

## Splitting into units of work

`/to-tickets` (Matt Pocock) · `/triage` (Matt Pocock)

- **`/to-tickets`** for work *you* produced — a plan, a spec, a conversation. It declares the blocking edges between tickets, which is indispensable as soon as one fix waits on a schema change or a fixture.
- **`/triage`** only for issues you did not write: bug reports, incoming requests. Tickets that came out of `/to-tickets` are already agent-ready — putting them through triage is wasted work.

## Handing over

`/handoff` (Matt Pocock) · `/context-save` (gstack) · `/compact` (native)

- **`/compact`** by default, at a phase boundary. It is a native harness command, not an installed skill, so it never appears in the catalogue and the "never invent a name" rule does not reach it — see the exception in `SKILL.md`.
- **`/context-save`** when you are the one resuming later, with `/context-restore` facing it.
- **`/handoff`** only for another harness, another directory, or a human. What it buys is portability; otherwise it costs more than it returns. `/claude-handoff` goes further: it launches the agent that takes over.

## Routing

`/which-skill` · `/gstack` · `/ask-matt` · `/find-skills`

- **`/which-skill`** by default — this skill. It is the only one that crosses packs, and crossing packs is the whole problem. Naming yourself as the default in your own arbitration is self-serving unless the reason is checkable: the others cannot see outside their pack, and you can verify that in one reading of their descriptions.
- **`/gstack`** when the work is entirely inside gstack and you want its own vocabulary — it knows its skills better than any outsider can.
- **`/ask-matt`** likewise inside the engineering suite.
- **`/find-skills`** when nothing installed covers the need and one has to be found outside.

## Making a skill

`/skill-creator:skill-creator` · `/superpowers:writing-skills` · `/skillify` (gstack)

- **`/skillify`** to freeze a `/scrape` flow that just worked.
- **`/skill-creator:skill-creator`** to start from nothing, with numeric evals and trigger optimisation.
- **`superpowers:writing-skills`** for the drafting discipline and the pre-deployment check. It combines with the previous one rather than replacing it.

## Securing the session

`/careful` · `/guard` · `/freeze` · `git-guardrails-claude-code`

- **`/guard`** by default: it warns on destructive commands *and* adds the editing perimeter. It contains `/careful`, so do not install both.
- **`/careful`** when you want the warnings without the perimeter — a session that must stay free to edit anywhere, on a repo where a wrong `rm` costs more than a wrong file. It is also the one to keep if `/guard`'s perimeter fights your workflow instead of protecting it.
- **`/freeze`** restricts edits to one directory for the session, `/unfreeze` releases. Useful during a targeted fix to prevent drift.
- **`git-guardrails-claude-code`** installs hooks that block `git push`, `reset --hard` and friends before execution. That is a one-time install, not a chain step.

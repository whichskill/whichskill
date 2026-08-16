# Installed skill catalogue

Fixture. Hand-written for the eval suite, never generated.

Two reasons it is not a real generated catalogue. Runs have to be reproducible on
any machine, not just the author's — that is the same defect the shipped
placeholder exists to prevent. And the descriptions below are written here rather
than harvested, so no third party's prose is redistributed to make a test pass.

It is deliberately small: every skill an eval could legitimately reach, plus a few
decoys the router should reject.

Never invoke a name that does not appear in this file.

## gstack

- `/investigate` — Systematic debugging with root cause investigation.
- `/freeze` — Restrict file edits to a specific directory for the session.
- `/unfreeze` — Clear the freeze boundary set by /freeze.
- `/ship` — Ship workflow: run tests, review the diff, commit, push, open a pull request.
- `/land-and-deploy` — Merge, deploy and verify in one move.
- `/review` — Pre-landing review of a branch's full diff.
- `/qa` — Systematically QA test a web application and fix the bugs found.
- `/health` — Code quality dashboard.
- `/cso` — Chief Security Officer mode: OWASP Top 10 and STRIDE.
- `/spec` — Turn vague intent into a precise, executable spec.
- `/office-hours` — Decide whether an idea is worth building.
- `/canary` — Post-deploy canary monitoring.
- `/benchmark` — Performance regression detection.
- `/design-review` — Designer's eye QA on a built screen.
- `/context-save` — Save working context for a later session.

## superpowers

- `/superpowers:systematic-debugging` — Systematic debugging, superpowers method.
- `/superpowers:brainstorming` — Explore intent and requirements before implementation.
- `/superpowers:test-driven-development` — Write the failing test before the code.

## Matt Pocock engineering suite

- `/diagnosing-bugs` — Refuses to theorise until a command goes red on this exact bug, then fixes with a regression test.
- `/tdd` — Red test first, then the implementation.
- `/code-review` — Two axes per ticket: documented standards, and what the issue asked for.
- `/to-tickets` — Split work you produced into tickets, with the blocking edges declared.
- `/triage` — Sort incoming issues you did not write.
- `/implement` — Implement one ticket against a spec.
- `/resolving-merge-conflicts` — Resolve a merge or rebase conflict in progress.
- `/handoff` — Hand a session over to another harness or another person.
- `/improve-codebase-architecture` — Find the missing seam in a module that aged badly.

## Standalone

- `/graphify` — Build a knowledge graph of an unfamiliar codebase.
- `/domain-audit` — Map the domain concepts a codebase actually implements.
- `/learn` — Record what a session taught, so it is not relearned.
- `/find-skills` — Search for a skill to install when nothing installed covers the need.

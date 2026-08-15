# Arbitrating the duplicates

Four packs installed side by side means three debuggers, two TDDs, three code reviews, four ways to frame an idea. They do not do the same thing. Deciding is this router's main service: never hand back two competitors and leave the choice open.

## Debugging

`/investigate` (gstack) · `/diagnosing-bugs` (Matt Pocock) · `/superpowers:systematic-debugging`

- **`/investigate`** by default. It is the only one wired into the rest of gstack — it hands off naturally to `/freeze`, `/qa`, `/ship`.
- **`/diagnosing-bugs`** when the bug resists: intermittent, a regression between two states you believed healthy, or a first look that already failed. It refuses to theorise until a command goes red on *this* bug, then fixes with a regression test. Its post-mortem hands off to `/improve-codebase-architecture` when the real problem is a missing seam.
- **`superpowers:systematic-debugging`** only if the session is already running the superpowers method.

**None of the three** when the cause is already known. A report that gives you the file, the line and the mechanism has finished the diagnosis: go straight to the red test.

## Writing tested code first

`/tdd` (Matt Pocock) · `/superpowers:test-driven-development`

- **`/tdd`** if `/implement` is in the chain — `/implement` drives it internally, and mixing them puts two competing disciplines on one diff.
- **`superpowers:test-driven-development`** inside a superpowers chain (`brainstorming` → `writing-plans` → `executing-plans`).

## Reviewing code

`/code-review` (Matt Pocock) · `/review` (gstack) · `/superpowers:requesting-code-review`

All three, at different moments — they are not competitors.

- **`/code-review`** at the end of each ticket. Two axes: does the code follow the repo's documented standards, and does it do what the issue asked.
- **`/review`** before `/ship`. The pre-landing review of the branch's full diff.
- **`superpowers:requesting-code-review`** when you want an independent subagent to verify the work answers the request.
- **`/codex`** in addition, not instead, when the stakes justify a second model on the same diff.

## Framing an idea

`/office-hours` · `/spec` (gstack) · `/grill-with-docs` · `superpowers:brainstorming`

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

- **`/compact`** by default, at a phase boundary.
- **`/context-save`** when you are the one resuming later, with `/context-restore` facing it.
- **`/handoff`** only for another harness, another directory, or a human. What it buys is portability; otherwise it costs more than it returns. `/claude-handoff` goes further: it launches the agent that takes over.

## Routing

`/gstack` · `/ask-matt` · `/find-skills`

- **`/gstack`** routes within gstack, **`/ask-matt`** within the engineering suite. Both ignore the other packs.
- **`/find-skills`** when nothing installed covers the need and one has to be found outside.

## Making a skill

`/skill-creator:skill-creator` · `/superpowers:writing-skills` · `/skillify` (gstack)

- **`/skillify`** to freeze a `/scrape` flow that just worked.
- **`/skill-creator:skill-creator`** to start from nothing, with numeric evals and trigger optimisation.
- **`superpowers:writing-skills`** for the drafting discipline and the pre-deployment check. It combines with the previous one rather than replacing it.

## Securing the session

`/careful` · `/guard` · `/freeze` · `git-guardrails-claude-code`

- **`/careful`** warns on destructive commands. **`/guard`** adds the editing perimeter. `/guard` contains `/careful`: do not install both.
- **`/freeze`** restricts edits to one directory for the session, `/unfreeze` releases. Useful during a targeted fix to prevent drift.
- **`git-guardrails-claude-code`** installs hooks that block `git push`, `reset --hard` and friends before execution. That is a one-time install, not a chain step.

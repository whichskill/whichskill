---
situation: A bug that resists
title: A bug that resists.
verdict: Run /diagnosing-bugs. Not /investigate.
subtitle: Three debuggers installed. Two lose here. This is the order.
steps:
  - ref: matt-pocock/diagnosing-bugs
    why: Refuses to theorise until a command goes red on this exact bug. That refusal is the whole point once the first look has already failed.
    produces: a red test
  - ref: gstack/freeze
    why: Locks edits to one directory for the session, so a targeted fix cannot quietly widen into a refactor while your attention is on the bug.
    produces: a scoped blast radius
  - ref: matt-pocock/tdd
    why: The red test comes before the ticket, never after. A guard rail disabled in silence only stays fixed if a test fails on today's code.
    produces: a regression test
  - ref: matt-pocock/code-review
    why: Standards and spec, checked as two separate questions. Runs per ticket, not per branch, so the answer stays small enough to act on.
  - ref: gstack/ship
    why: Stops at the pull request, which is the right place to stop when the fix touches something you had to fight to understand.
    produces: a pull request
  - ref: specialized/learn
    why: A bug that resisted once will resist again in a neighbouring file. Write down what the first look missed, while you still remember it.
substitutes:
  - ref: gstack/land-and-deploy
    insteadOf: gstack/ship
    why: When the fix has to reach production in one move, this does merge, deploy and verify without a second session.
notRun:
  - ref: gstack/investigate
    why: The default debugger, and the right one nine times out of ten. Not here — it is built to move fast on a fresh lead, and this bug already survived that.
    seeArbitration: three-debuggers
  - ref: superpowers/systematic-debugging
    why: Same job, different dialect. Only worth it if the session is already running the superpowers method; mixing two disciplines on one diff buys nothing.
    seeArbitration: three-debuggers
  - ref: gstack/qa
    why: Finds bugs, does not diagnose them. You already have the bug.
note: If a report already gives you the file, the line and the mechanism, the diagnosis is done. Skip straight to the red test.
---

The chain that assumes your first look already failed.

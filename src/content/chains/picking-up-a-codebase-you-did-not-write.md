---
situation: Picking up a codebase you did not write
title: Picking up a codebase you did not write.
verdict: Run /graphify first. Read nothing by hand until it answers.
subtitle: Four steps before you are allowed to have an opinion about the code.
steps:
  - ref: specialized/graphify
    why: Builds a queryable graph of the repo once, so the next forty questions cost a query instead of a grep. Reading files in the order you happen to open them teaches you the file system, not the system.
    produces: a persistent graph
  - ref: specialized/domain-audit
    why: Splits the repo into functional sections and scores each one, which turns "this is a mess" into a ranked list you can actually act on.
    produces: a scored audit
  - ref: gstack/health
    why: Separates the parts that are badly written from the parts that are merely unfamiliar. Those two feel identical on day one and need opposite responses.
  - ref: matt-pocock/improve-codebase-architecture
    why: Only now. Proposing seams before the audit is guessing with confidence.
  - ref: matt-pocock/triage
    why: The audit produces more work than anyone will do. Triage decides what gets touched, and admits what does not.
notRun:
  - ref: gstack/investigate
    why: Nothing is broken yet. Reaching for a debugger to learn a codebase is how you end up understanding one function very well and the system not at all.
  - ref: matt-pocock/to-tickets
    why: Too early. Tickets written before the audit encode your first impression, which is the impression most likely to be wrong.
note: The order matters more here than in most chains. Every step exists to stop you forming an opinion one step too early.
---

Four steps before you are allowed to have an opinion.

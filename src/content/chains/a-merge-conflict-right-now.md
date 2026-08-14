---
situation: A merge conflict, right now
title: A merge conflict, right now.
verdict: Run /resolving-merge-conflicts. That is the whole chain.
subtitle: One step. Do not pad it out to look serious.
steps:
  - ref: matt-pocock/resolving-merge-conflicts
    why: Reads both sides, reconstructs what each was trying to do, and resolves against that intent rather than against whichever hunk is easier to keep.
notRun:
  - ref: gstack/review
    why: A conflict is not a diff to judge. Review the result afterwards if the merge was large, never during.
  - ref: matt-pocock/code-review
    why: Same reason. The question right now is what the two sides meant, not whether the code follows house standards.
note: A one-element chain is a real answer. Padding it to five steps would be the padding, not the help.
---

The shortest chain here, and it stays short on purpose.

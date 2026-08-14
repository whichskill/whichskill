---
terrain: debug
title: Three debuggers. One default.
verdict: Default to /investigate.
competitors:
  - ref: gstack/investigate
    wins: true
    why: The only one wired into the rest of gstack. It hands off naturally to /freeze, /qa and /ship, so the chain keeps moving instead of ending at a diagnosis.
  - ref: matt-pocock/diagnosing-bugs
    wins: false
    why: Loses on a fresh lead. Its refusal to theorise before a command goes red is discipline you do not need to buy when the first look is likely to land.
    whenItWins: The bug is intermittent, or it is a regression between two states you believed were both healthy, or your first look already failed.
  - ref: superpowers/systematic-debugging
    wins: false
    why: Loses on dialect. It pulls a whole method into a session that is not running that method, and two disciplines on one diff cancel out.
    whenItWins: The session is already superpowers end to end.
noneOfThem: None of the three when the cause is already known. A report that gives you the file, the line and the mechanism has finished the diagnosis. Go straight to the red test.
---

Three skills, one job, and the wrong choice costs a session.

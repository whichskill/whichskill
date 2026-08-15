# which-skill

A router for people who installed too many agent skills.

You have gstack, superpowers, the Matt Pocock engineering suite and a dozen standalone skills. Three of them debug. Two do TDD. Three review code. When you sit down to work, the question is no longer "can my agent do this" but "which of these four do I run, and in what order".

`which-skill` answers that in one shot: an ordered chain, and the arbitration already settled.

## The failure mode it exists to remove

Ask any agent "which skill should I use for this bug" and it will name every plausible one. A list of nine names is worse than no answer — you walk away holding the entire arbitration, which is the problem you came with.

This skill never does that. It returns a chain of three to seven steps, a one-line reason for each step that needs one, and an explicit list of what you do **not** run and why.

```
## The chain

/diagnosing-bugs → /freeze → /tdd → /code-review → /ship → /learn

## Why

/diagnosing-bugs rather than /investigate: it refuses to theorise until a command
goes red on this exact bug, and that refusal is the whole point once the first
look has already failed.

## What you do not run

- /investigate — the right default nine times out of ten, but built to move fast
  on a fresh lead, and this bug already survived that
- /qa — finds bugs, does not diagnose them. You already have the bug.
```

## Install

```bash
git clone https://github.com/whichskill/whichskill ~/.claude/skills/which-skill
bash ~/.claude/skills/which-skill/scripts/build-catalogue.sh
```

**The second command is not optional.** The router refuses to invoke a skill name that is not in `references/catalogue.md`, and that catalogue lists what is installed on *your* machine. It ships empty on purpose — shipping the author's would make the router confidently recommend commands you do not have. Re-run it whenever you add or remove a pack.

Then just ask, in any session:

> which skill do I run for this?

## What is inside

| File | What it holds |
|---|---|
| `SKILL.md` | The method: place the request, subtract what is already done, compose, arbitrate, name the exclusions |
| `references/chains.md` | Canonical chains by kind of work — web, design, backend, 0→1, iOS, data, security, DevEx, legacy, docs, scraping, meta |
| `references/arbitration.md` | Which skill wins on the contested ground: debugging, TDD, code review, framing, splitting, handover, routing, skill-making, session safety |
| `references/catalogue.md` | Generated. What is actually installed here. |
| `scripts/build-catalogue.sh` | Generates the above from disk |

The step that makes the difference is subtraction. Someone who arrives with a bug localised to the line has finished their diagnosis; handing them a debugger asks them to redo, in front of you, what they just did. The skill looks for that evidence before it proposes anything, and says out loud which steps it removed.

## Scope, honestly

The arbitration is opinionated, and it covers the packs it names. It does not know every skill in existence — nobody does, and a router that pretends to would send you to commands that do not exist. The catalogue keeps it honest: if it is not installed, it is not recommended.

Where an arbitration is missing, the skill says so rather than guessing.

Contributions that add a chain or settle a new piece of contested ground are the useful kind. An arbitration entry needs three things: the competing skills, which one wins by default, and — for each loser — the situation where it wins instead. That last line is not politeness, it is the part that makes the verdict trustworthy.

## Licence

- **Code** (`scripts/`) — MIT.
- **Prose** (`SKILL.md`, `references/chains.md`, `references/arbitration.md`) — CC BY-SA 4.0.

Skill names and the descriptions in a generated catalogue belong to their respective authors; the catalogue is produced locally on your machine and is not redistributed here.

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

**The second command is not optional.** The router refuses to invoke a skill name that is not in `references/catalogue.md`, and that catalogue lists what is installed on *your* machine. The repository ships no catalogue at all — shipping the author's would make the router confidently recommend commands you do not have. Re-run it whenever you add or remove a pack.

## Updating

```bash
git -C ~/.claude/skills/which-skill pull
```

Your generated catalogue is ignored by git, so it survives the pull untouched and never conflicts with it.

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

## Verifying it works

```bash
python3 scripts/run-evals.py
```

Four evals, eighteen assertions. They check the things that are easy to get wrong: that a finished diagnosis is subtracted instead of repeated, that `/triage` is not confused with `/to-tickets`, that a one-skill answer is not padded, and that a French question gets a French answer.

Two limits worth knowing before you trust a green run:

- **They measure routing quality, not triggering.** The harness injects the skill rather than letting discovery happen, so whether the frontmatter description actually surfaces the skill is untested.
- **The fixture catalogue is not authoritative.** The runner inlines `evals/fixtures/catalogue.md` as the skill's catalogue, but the agent running underneath also sees the skills genuinely installed on that machine, and it may route on those instead — measured directly, it says so out loud when asked. So a green run on a machine that happens to have the same packs proves less than it looks. Isolating this needs a machine with a different pack set.

## Arbitrating your own duplicates

The shipped arbitration is fixed prose about specific skills. The catalogue can filter it, but it cannot invent an argument for skills nobody has written about — that would be exactly the confident, hollow answer this skill exists to prevent.

So two things happen instead.

**It tells you where the gap is.** `build-catalogue.sh` compares what you have installed against what the arbitration covers, and appends a section when it finds several skills on the same ground with no argument between them:

```
## Possible unarbitrated overlap

### review — 3 installed, 1 arbitrated
- `/review`
- `/superpowers:receiving-code-review`
- `/postgresql-code-review`
```

Keyword matching on descriptions is crude, so this is a signal, not a verdict. A missed overlap costs nothing; a claimed one that is wrong would cost trust.

**You can settle them yourself.** Create `references/arbitration.local.md` and the router reads it alongside the shipped one, with yours winning on any skill both mention. It is gitignored, so it survives updates and never ends up in a pull request by accident.

```markdown
## Reviewing code

`/code-review` (Matt Pocock) · `/postgresql-code-review`

- **`/postgresql-code-review`** on anything touching schema, JSONB or query plans —
  it knows the anti-patterns the generic review cannot see.
- **`/code-review`** everywhere else.
```

Three parts make an arbitration: the competitors, which one wins by default, and — for each loser — the situation where it wins instead. Without the third it is a preference, not an arbitration.

If yours is good, send it upstream.

## Scope, honestly

The arbitration is opinionated, and it covers the packs it names. It does not know every skill in existence — nobody does, and a router that pretends to would send you to commands that do not exist. The catalogue keeps it honest: if it is not installed, it is not recommended.

Where an arbitration is missing, the skill says so rather than guessing.

That gap is not assumed, it is measured. A survey of about twenty skill directories
([notes](docs/research/directories-by-chain.md), in French) found exactly one published arbitration
between competing skills — gstack's "Which review should I use?", which covers reviews only and
never leaves its own pack. Plenty of projects publish an ordered workflow; choosing *between* two
skills that do almost the same job is the part nobody writes down.

Contributions that add a chain or settle a new piece of contested ground are the useful kind. An arbitration entry needs three things: the competing skills, which one wins by default, and — for each loser — the situation where it wins instead. That last line is not politeness, it is the part that makes the verdict trustworthy.

## Licence

- **Code** (`scripts/`) — MIT.
- **Prose** (`SKILL.md`, `references/chains.md`, `references/arbitration.md`) — CC BY-SA 4.0.

Skill names and the descriptions in a generated catalogue belong to their respective authors; the catalogue is produced locally on your machine and is not redistributed here.

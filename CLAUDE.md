# which-skill

A routing skill for developers with several agent-skill packs installed. It returns an ordered
chain and the arbitration already settled, instead of a list of plausible names.

This repository **is** the skill. Installing it means cloning it into `~/.claude/skills/which-skill`,
so everything committed here lands in someone's skills directory. Keep it lean.

## Layout

| Path | Role |
|---|---|
| `SKILL.md` | The method and the hard rules. Its YAML frontmatter is what makes the skill trigger. |
| `references/chains.md` | Canonical chains by kind of work |
| `references/arbitration.md` | Which skill wins on contested ground, and when each loser wins instead |
| `references/catalogue.md` | **Generated per machine, untracked, never shipped.** A fresh clone has none. |
| `references/arbitration.local.md` | The installer's own arbitration — lives in `~/.which-skill/`, not here |
| `scripts/build-catalogue.sh` | Generates the catalogue from the installing machine |
| `site/` | The one-page landing site. Not part of the skill. |

## Three rules that are load-bearing

1. **Never track `references/catalogue.md`.** It lists what is installed on one machine, so
   committing yours makes the router recommend commands the next person does not have. It is not
   merely "committed empty" — it is not tracked at all, and that distinction is the update path:
   while it was tracked, generating it left every user's working tree dirty and broke their
   `git pull`. CI asserts that neither it nor `arbitration.local.md` is tracked.
2. **Never invent a skill name**, in the chains or the arbitration. If a name is not real and
   installable, it must not appear. Native harness commands (`/compact`, `/clear`) are the single
   exception, because no generator can list them. This rule used to depend entirely on the author's
   discipline, and that discipline failed: `code-simplifier` is a plugin *agent*, not a skill, and
   it sat inside a canonical chain until a review checked every name against the disk. Run
   `bash scripts/build-catalogue.sh --audit` before touching the prose — it reports every name that
   is not installed here. Absent on your machine is expected; absent on every machine is the bug.
3. **Every loser in an arbitration gets a "when it wins" line.** Taking a position is not the same
   as pretending the alternative is worthless, and that line is what makes the verdict trustworthy.
   An arbitration entry without it is incomplete.

## Voice

Direct, second person, opinionated. The skill decides; it does not survey. Prose is in English.

The word "recommended" is avoided in the skill's own output — it hedges, and the skill exists to
not hedge.

## Editing the arbitration

Adding contested ground needs three things, in this order: the competing skills, which one wins by
default and why in one line, and for each loser the situation where it wins instead. Anything less
is a preference, not an arbitration.

Do not add a chain longer than seven steps. Past seven, the subtraction step was skipped. CI counts
them now, so this is enforced rather than requested. A workflow that genuinely spans more — idea to
shipped product — is written as separate phases, and the router answers with the phase the person is
in, never with all of them.

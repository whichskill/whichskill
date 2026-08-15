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
| `references/catalogue.md` | **Generated, never committed with real content.** Ships as a `NOT GENERATED` placeholder. |
| `scripts/build-catalogue.sh` | Generates the catalogue from the installing machine |
| `site/` | The one-page landing site. Not part of the skill. |

## Three rules that are load-bearing

1. **Never commit a real `references/catalogue.md`.** It lists what is installed on one machine.
   Committing yours makes the router recommend commands the next person does not have. CI fails
   the build if the `NOT GENERATED` marker is gone — that guard is not decoration, it is the most
   likely accident in this repo.
2. **Never invent a skill name**, in the chains or the arbitration. If a name is not real and
   installable, it must not appear. The catalogue is the machine-side enforcement of this; the
   prose files depend on the author's discipline.
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

Do not add a chain longer than seven steps. Past seven, the subtraction step was skipped.

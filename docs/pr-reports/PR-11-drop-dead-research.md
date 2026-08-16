# PR #11 — Arrêter d'expédier les notes d'un projet qui n'existe plus

## Contexte

Point de suivi ouvert depuis la PR #2, redit dans la PR #7, jamais tranché : `research/` contenait
trois notes dont deux portaient sur le site Astro abandonné. Ce dépôt **est** le skill — tout ce
qui y est commité atterrit dans le `~/.claude/skills/which-skill/` de chaque installateur.

Mesuré avant de décider : `research/` faisait **52K, le plus gros dossier du dépôt**, davantage que
le skill lui-même (`references/` 36K + `scripts/` 24K + `SKILL.md`). Le `CLAUDE.md` du projet dit
« Keep it lean » ; c'était la plus grosse infraction du dépôt à sa propre règle.

## Ce qui part

| Note | Lignes | Sujet |
|---|---|---|
| `ui-ux-reference-dense.md` | 279 | l'UI du site abandonné |
| `sources-ingestion-skills.md` | 149 | l'ingestion machine d'un inventaire pour peupler ce site |

Les deux appartiennent à une direction close le jour où le projet est devenu un skill à partager.
Récupérables dans l'historique en `edd3e26`.

## Ce qui reste, et qui gagne sa place

`etape-0-annuaires-par-chaines.md` → `docs/research/directories-by-chain.md`.

C'est le **seul argument sourcé de l'existence du skill** : une vingtaine d'annuaires parcourus, et
exactement **un** arbitrage publié entre skills concurrents trouvé où que ce soit — le « Which
review should I use? » de gstack, qui ne couvre que les revues et ne sort jamais de son propre pack.
Beaucoup de projets publient un ordre d'étapes ; choisir *entre* deux skills qui font presque la
même chose est la partie que personne n'écrit.

La note a aussi **falsifié la prémisse qu'elle devait confirmer** — « aucun annuaire n'organise par
chaînes » s'est révélé faux, et le vrai vide était plus étroit. C'est la raison de garder la note
et non un résumé : le résumé aurait conservé la conclusion en perdant la correction.

Le README y renvoie désormais depuis « Scope, honestly », donc l'affirmation cesse d'être une
affirmation. Une préface anglaise dit ce qu'est le fichier ; le corps reste en français, parce que
retraduire des affirmations sourcées est la façon dont elles dérivent.

## Ce qui a changé

| Fichier | Nature |
|---|---|
| `research/ui-ux-reference-dense.md` | supprimé |
| `research/sources-ingestion-skills.md` | supprimé |
| `docs/research/directories-by-chain.md` | déplacé depuis `research/`, préface ajoutée |
| `README.md` | « Scope, honestly » cite la mesure et lie la note |

428 lignes retirées, 15 ajoutées.

## Vérification

| Contrôle | Résultat |
|---|---|
| `bash -n scripts/build-catalogue.sh` | OK |
| Frontmatter `SKILL.md` sous `yaml.safe_load` strict | OK, `['name', 'description']` |
| `references/catalogue.md` toujours non traqué | OK |
| Le harnais d'évals compose encore | 23 053 caractères |
| Référence pendante à `research/` dans `site/`, `.github/`, scripts | aucune |
| CI (`verify` + Cloudflare Pages) | verte |

`shellcheck` n'est pas installé localement ; il tourne en CI, où il est passé.

## Le vrai test de cette session : le cycle d'installation, en vrai

Découverte en ouvrant la session : **l'auteur ne faisait pas tourner son propre skill.**
`~/.claude/skills/which-skill` n'était pas un clone git — une copie figée du 12 août, `SKILL.md` en
français, `references/arbitrage.md` et `chaines.md` aux anciens noms, six fichiers, pas de `.git`.
Les cinq PR mergées depuis n'avaient jamais atteint la machine, et `git pull` y était impossible.

Réinstaller a donc servi deux fois : corriger l'installation, et **parcourir pour la première fois
le chemin documenté du README sur une vraie machine**. Les trois commandes, dans l'ordre :

| Commande | Résultat |
|---|---|
| `git clone … ~/.claude/skills/which-skill` | version anglaise chargée, `git status` vide |
| `bash …/scripts/build-catalogue.sh` | 123 skills, code 0, recouvrement `review` détecté |
| `git -C … pull` (après merge de cette PR) | code 0, `research/` disparu |

Le catalogue généré a survécu au `pull` **intact** — 19090 octets, horodatage inchangé. C'est la
correction de la PR #7 vérifiée depuis un clone neuf plutôt qu'en théorie.

### Un piège trouvé en le faisant

Sauvegarder l'ancien dossier en `~/.claude/skills/which-skill.backup-20260816` l'a immédiatement
**enregistré comme un skill concurrent** : Claude Code scanne tout répertoire de `~/.claude/skills/`
et charge son frontmatter. Deux routeurs se sont retrouvés en lice, l'ancien français et le nouveau.
Déplacé vers `~/.claude/backups/`, hors du chemin de scan.

C'est le même mode de défaillance que les trois défauts précédents — invisible en raisonnant,
immédiat en exécutant.

## PR

https://github.com/OmarBenje/whichskill/pull/11 — **mergée** (squash), branche supprimée.

## Points de suivi

1. **Les rapports #2 et #7 nomment encore les chemins supprimés.** Laissés tels quels : ce sont des
   documents datés de ce qui était vrai alors, et le commit `edd3e26` les résout.
2. **La distribution.** `ComposioHQ/awesome-claude-skills#1636` toujours ouverte, `REVIEW_REQUIRED`,
   zéro commentaire. Et la question laissée en suspens a sa réponse, obtenue via l'API plutôt que par
   raisonnement : **`claudeskills.info` n'auto-indexe pas** — 383 skills, tous soumis à la main via
   le formulaire de `claudeskills.info/submit/` (HTTP 200, rendu en JS). C'est une action humaine.
3. **`docs/pr-reports/` fait 32K et part aussi chez chaque installateur.** Contrairement à
   `research/`, c'est le registre du projet et il a sa légitimité — mais la question se reposera si
   le dossier double encore.

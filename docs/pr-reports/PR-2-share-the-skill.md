# PR #2 — Le dépôt devient le skill, en anglais

## Contexte

Le projet était un site de référence publiant des chaînes de skills d'agent indexées par
situation, avec arbitrage entre skills concurrents. Il était en ligne, avec sa CI, son gate
d'intégrité et 28 tests.

Deux constats l'ont arrêté. D'abord le corpus décrivait une seule machine : un visiteur tombait
sur des chaînes faites de skills qu'il n'a pas installés, et repartait. Ensuite, et surtout, la
valeur n'a jamais été le site — c'était l'arbitrage. Un skill le livre là où la décision se prend,
dans l'agent, au lieu d'exiger une visite sur une URL.

Le basculement annule au passage le plus gros coût restant du projet : les ~208 phrases `why`
servaient uniquement à déplier sur 33 pages ce que `chains.md` et `arbitration.md` disent déjà
sous forme compacte.

## Ce qui a changé

Le dépôt **est** le skill. `git clone` dans `~/.claude/skills/which-skill` l'installe.

| Fichier | Nature du changement |
|---|---|
| `SKILL.md` | Nouveau, à la racine. Méthode et règles dures, traduites en anglais. Le frontmatter YAML est ce qui déclenche le skill. |
| `references/chains.md` | Traduction de `chaines.md` — chaînes canoniques par type de travail |
| `references/arbitration.md` | Traduction de `arbitrage.md` — qui gagne sur les terrains disputés |
| `references/catalogue.md` | **Placeholder `NOT GENERATED`**, jamais le vrai catalogue |
| `scripts/build-catalogue.sh` | Repris, commentaires et intitulés de sections en anglais |
| `evals/evals.json` | 4 évals ; la n°0 réécrite sur du code inventé, la n°3 laissée en français |
| `README.md` | Réécrit : problème, exemple de sortie, installation, périmètre assumé |
| `CLAUDE.md` | Réécrit pour un dépôt de skill, avec trois règles porteuses |
| `LICENSE` | Chemins du double licenciement corrigés — MIT pour `scripts/`, CC BY-SA pour la prose |
| `.github/workflows/ci.yml` | Remplacé : plus de build Astro, quatre gardes propres au skill |
| `site/index.html` | Page unique, sans build |
| Supprimés | `src/`, `tests/`, `integrations/`, `corpus/`, `astro.config.mjs`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `DESIGN.md`, `scripts/migrate-corpus.mjs`, `scripts/setup-github.sh` |

Total : 74 fichiers, 1 171 insertions, 10 511 suppressions. Tout reste dans l'historique git.

### Le défaut corrigé, qui aurait cassé chaque installation

Le catalogue livré était celui de l'auteur. La règle dure du skill étant « n'invoque jamais un nom
absent du catalogue », un nouvel installateur se serait fait router avec assurance vers des
commandes qu'il n'a pas. Trois mesures : le fichier part en placeholder, `SKILL.md` impose de
générer avant de router, et la CI échoue si un vrai catalogue est committé.

### La fuite évitée

L'éval n°0 contenait environ 1 600 caractères de ce qui ressemble à un projet privé — noms de
fichiers, numéros de ligne, logique métier d'éligibilité. Réécrite sur du code inventé en
conservant sa forme, puisque c'est l'éval qui teste l'étape de soustraction. Un dépôt public ne se
dé-publie pas.

## Vérification

| Contrôle | Résultat |
|---|---|
| `bash -n scripts/build-catalogue.sh` | OK |
| Générateur sur machine peuplée | 123 skills, 4 sections |
| Générateur sur `~/.claude/skills` vide | sortie 0, 4 sections, 0 skill |
| `evals.json` | JSON valide, 4 évals |
| Page d'accueil | rendue et relue en 1100px |
| `shellcheck` | **a échoué au premier run, corrigé, vert au second** — voir ci-dessous |

Il n'y a plus de build ni de suite de tests : le dépôt ne contient plus de code applicatif.

### Ce que shellcheck a attrapé

`shellcheck` n'était pas installé sur la machine d'écriture, donc l'étape est partie non vérifiée
et la CI est tombée rouge au premier run. Deux signalements de niveau `info` :

- **SC2016** sur la chaîne de format `printf` — faux positif. Les quotes simples sont précisément
  ce qui empêche `%s` de s'étendre avant que `printf` le voie. Supprimé avec le motif écrit en
  commentaire.
- **SC2020** sur `tr ' \n' '\n\n'` — signalement utile. L'ensemble d'arrivée contenait deux fois
  `\n`, ce qui rendait l'intention ambiguë. `tr` complète seul un ensemble d'arrivée trop court
  avec son dernier caractère, donc `tr ' \n' '\n'` fait le même travail sans le doublon.

Correction vérifiée comme préservant le comportement : mêmes 123 skills, et la section Matt Pocock
conserve ses 30 entrées — si la classification s'était cassée, elles seraient toutes tombées dans
« Standalone ».

## PR

https://github.com/OmarBenje/whichskill/pull/2 — **mergée** (merge commit `97b5db8`), branche
supprimée. CI verte au moment du merge.

## Suite : PR #3 et #4

- **#3** — https://github.com/OmarBenje/whichskill/pull/3, mergée. Portait la mise à jour de ce
  fichier : l'état mergé de #2, et `shellcheck` passé de « non vérifié » à « rouge, corrigé, vert ».
- **#4** — https://github.com/OmarBenje/whichskill/pull/4, mergée. Rattrape deux défauts de #3 :
  le commit qui consignait #3 n'a pas atterri sur `main`, et la numérotation ci-dessous sautait
  le point 3.

Le push direct sur `main` étant refusé par la protection de branche, corriger un fichier de
documentation demande une branche et une PR. La protection fonctionne comme prévu ; c'est le coût
assumé.

Ces PR sont consignées ici plutôt que dans des fichiers `PR-3-*.md` et `PR-4-*.md` séparés : chaque
rapport aurait exigé sa propre PR, qui aurait exigé son propre rapport.

## Points de suivi

1. **Cloudflare Pages attend encore un build Astro.** Après merge, vider le champ « Build command »
   et mettre « Build output directory » à `site`. Tant que ce n'est pas fait, le dernier déploiement
   réussi reste en ligne : le site ne disparaît pas, il cesse d'être mis à jour.
2. **Le skill local reste la version française.** Le dépôt anglais ne le remplace pas tout seul.
3. **`research/`** embarque trois notes, dont deux portent sur le site abandonné. Elles atterrissent
   dans le dossier de skills de chaque installateur. À trancher : les garder ou les sortir.
4. **La distribution reste à faire.** Publier le dépôt ne le fait pas connaître ; les agrégateurs
   identifiés dans `research/sources-ingestion-skills.md` sont le canal.

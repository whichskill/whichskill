# PR #5 — Les évals deviennent exécutables

## Contexte

Le skill était publié et sur le point d'être annoncé. Ses quatre évals décrivaient le bon
comportement dans un champ `expected_output` rédigé — et ne le vérifiaient pas : chaque tableau
`assertions` était vide.

La qualité du skill reposait donc sur une lecture humaine. Or le défaut le plus grave trouvé ce
jour-là — le catalogue de l'auteur livré à tout installateur — est exactement le genre de chose
qu'une éval sur installation vierge attrape et qu'une relecture manque.

## Ce qui a changé

| Fichier | Nature du changement |
|---|---|
| `scripts/run-evals.py` | Nouveau. Compose la prose du skill avec un catalogue de fixture, interroge `claude -p`, vérifie les assertions. |
| `evals/fixtures/catalogue.md` | Nouveau. Catalogue écrit à la main, ~30 skills, descriptions rédigées ici. |
| `evals/evals.json` | 18 assertions ajoutées, six types, plus une note sur la façon d'en écrire |
| `SKILL.md` | Règle anti-rallonge renforcée : le mécanisme de la dérive est nommé |
| `README.md` | Section « Verifying it works » |
| `.gitignore` | `evals/last-run/` |

### Pourquoi une fixture plutôt qu'un catalogue généré

Deux raisons, et les deux comptent. Une suite qui dépend des skills installés sur la machine de
l'auteur n'est pas reproductible — c'est le défaut même que le placeholder `NOT GENERATED`
existe pour empêcher. Et figer un vrai catalogue signifierait redistribuer les descriptions de
123 skills écrites par d'autres pour faire passer un test.

### Les assertions distinguent la chaîne du reste

Le skill **nomme** ce qu'il n'exécute pas. Vérifier l'absence de `/investigate` dans tout le texte
échouerait donc sur la bonne réponse. Les types `chain_contains` / `chain_absent` ne regardent que
la ligne de chaîne.

## Ce que l'exécution a trouvé

### Deux défauts du harnais

- L'extracteur de chaîne ne reconnaissait que les lignes à flèches. Une chaîne d'un seul élément —
  que `SKILL.md` déclare réponse valable et interdit de rallonger — était donc comptée comme
  chaîne absente. Le harnais notait le meilleur comportement du skill comme un échec.
- `chain_max_steps` passait quand aucune chaîne n'était trouvée : zéro étape sous un plafond de
  deux. Un échec d'analyse se lisait comme une conformité.

### Un vrai défaut du skill

Même question sur le conflit de merge, deux exécutions, deux réponses : une chaîne d'un élément au
premier passage, `/resolving-merge-conflicts → /review → /ship` au second. La règle « ne rallonge
pas » est écrite dans `SKILL.md` **et** dans `chains.md`, et elle a quand même sauté.

`SKILL.md` nomme désormais le mécanisme : les étapes qui seront vraies plus tard ne répondent pas
à une question sur maintenant. Trois passages consécutifs ont ensuite rendu une chaîne d'un
élément. **Trois passages sont un signal, pas une preuve de fiabilité.**

### Deux assertions fausses, pas le skill

Les deux exigeaient qu'une étape canonique figure dans la chaîne. Les deux fois, le skill l'avait
écartée avec un motif situationnel juste, énoncé dans les exclusions : `/freeze` parce que les
défauts couvrent deux répertoires et qu'une frontière à un seul bloquerait la moitié du travail,
`/review` parce que les deux axes de `/code-review` suffisent à une branche de cette taille — avec
la condition qui le ramènerait.

Réserver `chain_contains` aux étapes réellement non négociables est maintenant écrit dans la suite.

## Vérification

| Contrôle | Résultat |
|---|---|
| `evals.json` | JSON valide |
| Suite complète | **18/18 assertions**, 4 évals |
| Éval 2 après renforcement | 3 passages, 3 chaînes d'un élément |
| Garde-fou chaîne vide | échoue comme prévu |

## PR

https://github.com/whichskill/whichskill/pull/5 — **mergée** (merge commit `29ce6c5`), branche supprimée. CI verte au moment du merge.

## Points de suivi

1. **La suite mesure le routage, pas le déclenchement.** Le harnais injecte le skill au lieu de
   laisser la découverte opérer. Vérifier qu'un `description:` déclenche bien demande une vraie
   installation.
2. **La variance entre passages est réelle.** La chaîne de l'éval 0 change d'un passage à l'autre
   tout en restant correcte. Les assertions y sont insensibles par construction ; un jour où l'on
   voudra mesurer la stabilité elle-même, il faudra plusieurs passages par éval.
3. **Quatre évals couvrent quatre situations** sur les douze familles de `chains.md`.
4. **Cloudflare** attend toujours son changement de configuration.
5. **La distribution reste à faire.**

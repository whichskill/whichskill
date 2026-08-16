# PR #6 — Le frontmatter n'était pas du YAML valide

## Contexte

Question posée : « je pourrais le publier sur skills.sh après ? »

Plutôt que de répondre de mémoire, test direct de leur outil sur le dépôt publié :

```
$ npx skills@latest add whichskill/whichskill --list
◇  Repository cloned
⚠  Skipped SKILL.md — YAML parse error: Nested mappings are not allowed
   in compact mappings at line 2, column 14
└  No valid skills found.
```

**Le dépôt se clone, et il n'en sort rien.** Quiconque installait par cette voie
obtenait un échec silencieux : pas d'erreur bruyante, juste zéro skill.

## La cause

La description contenait deux `: ` non échappés :

- `...rather than doing the work: "which skill"...`
- `...answering from memory: a developer with...`

En YAML, un scalaire non quoté contenant `: ` est ambigu — le parseur y voit une
sous-clé. Confirmé par un parseur strict : `mapping values are not allowed here`.

Claude Code est tolérant et l'acceptait, ce qui rendait le défaut invisible ici :
le skill fonctionnait parfaitement sur la machine de l'auteur tout en étant
inutilisable partout ailleurs.

**Le défaut a été introduit à la traduction.** La version française d'origine
utilisait un tiret cadratin à ces deux endroits ; la version anglaise a mis des
deux-points.

## Pourquoi la CI ne l'a pas vu

L'étape « SKILL.md must stay discoverable » vérifiait la présence de la ligne
avec un `grep` :

```
grep -qE '^description: .{80,}' SKILL.md
```

Une ligne présente et longue passe ce test, valide ou non. La garde testait
l'existence, pas la validité.

## Ce qui a changé

| Fichier | Nature du changement |
|---|---|
| `SKILL.md` | Les deux `: ` de la description remplacés par des tirets cadratins |
| `.github/workflows/ci.yml` | Le `grep` remplacé par un vrai parseur YAML strict, qui vérifie aussi `name` et la longueur de la description sur la valeur *parsée* |

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| `yaml.safe_load` du frontmatter | `mapping values are not allowed here` | OK, description de 679 caractères |
| `npx skills add <chemin> --list` | `No valid skills found` | **`Found 1 skill`**, description affichée en entier |
| Suite d'évals | — | éval 2 au vert, chaîne d'un élément |

## PR

https://github.com/whichskill/whichskill/pull/6

## Points de suivi

1. **Tester avec l'outil du tiers plutôt que raisonner dessus** a trouvé en une
   commande ce que cinq PR et une CI verte avaient laissé passer. À refaire pour
   tout canal de distribution avant d'y soumettre quoi que ce soit.
2. **La tolérance de Claude Code masque les défauts de portabilité.** Un skill
   peut marcher parfaitement en local et être rejeté partout ailleurs ; seul un
   parseur strict le dit.
3. **La distribution reste à faire** — c'est ce qui a déclenché ce test.

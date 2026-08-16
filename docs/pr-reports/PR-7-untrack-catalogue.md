# PR #7 — Le catalogue généré n'est plus suivi, pour que les mises à jour marchent

## Contexte

Question posée : « et si je veux update le skill on fait comment ? »

Plutôt que de répondre de tête, vérification sur une installation réelle. Elle a montré que la
réponse aurait été fausse.

`references/catalogue.md` était **suivi par git**. Or générer ce fichier est la seconde moitié de
l'installation documentée. Conséquence immédiate, reproduite :

```
$ git clone … && bash scripts/build-catalogue.sh
wrote references/catalogue.md (123 skills)
$ git status --short
 M references/catalogue.md
```

L'arbre de travail de chaque utilisateur restait modifié en permanence. Et à la première version
qui toucherait ce fichier, sa mise à jour s'arrêtait :

```
Please commit your changes or stash them before you merge.
Aborting
```

Donc `git pull` fonctionnait tant que le placeholder n'était jamais édité, et cassait le jour où
il l'était. Une installation qu'on ne peut pas mettre à jour est pire qu'une installation qui
échoue bruyamment — celle-ci échouait en silence, et plus tard.

## Ce qui a changé

| Fichier | Nature du changement |
|---|---|
| `references/catalogue.md` | Retiré du suivi git (`git rm --cached`) et ignoré. Le dépôt ne livre plus aucun catalogue. |
| `.gitignore` | `references/catalogue.md` |
| `.github/workflows/ci.yml` | La garde passe de « le placeholder doit survivre » à « le chemin ne doit pas être suivi » |
| `README.md` | Section « Updating » |

`SKILL.md` n'a pas eu à changer : il traitait déjà le cas du fichier absent — *« If it is missing,
or still carries the NOT GENERATED marker, run scripts/build-catalogue.sh before routing. »*

### La garde CI devient plus forte, pas plus faible

Elle vérifiait que le texte `NOT GENERATED` survivait dans un fichier suivi. Elle vérifie
maintenant que le chemin n'est pas suivi du tout — c'est exactement la propriété dont dépend le
chemin de mise à jour, et elle ne peut pas être contournée par un fichier au bon contenu.

## Vérification

Test de bout en bout sur un clone neuf depuis GitHub, après merge :

| Étape | Résultat |
|---|---|
| `ls references/` sur un clone frais | `arbitration.md`, `chains.md` — aucun catalogue livré |
| `bash scripts/build-catalogue.sh` | 123 skills |
| `git status --short` | **vide** |
| `git pull` | passe |
| Catalogue après le pull | 123 entrées, intact |

L'échec d'origine a été reproduit avant d'être corrigé, pas seulement raisonné.

## PR

https://github.com/whichskill/whichskill/pull/7 — **mergée**, branche supprimée. CI verte.

## Points de suivi

1. **Le motif se répète** : trois défauts consécutifs — le catalogue de l'auteur livré, le
   frontmatter invalide, le catalogue suivi — étaient tous invisibles depuis la machine de
   l'auteur et tous trouvés en exécutant le vrai chemin d'un utilisateur. Cloner dans un dossier
   vide et faire ce qu'un inconnu ferait devrait précéder toute annonce.
2. **La distribution est engagée** : `ComposioHQ/awesome-claude-skills#1636` est ouverte.
3. **`research/`** contient toujours deux notes sur le site abandonné, qui atterrissent chez
   chaque installateur.

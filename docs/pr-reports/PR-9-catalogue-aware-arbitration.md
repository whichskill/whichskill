# PR #9 — L'arbitrage répond enfin aux skills installés

## Contexte

Constat posé pendant la session : *« les terrains sont précis, ça dépend du skill, non du catalogue
de l'utilisateur »*. Exact, et c'était la limite centrale du skill.

`arbitration.md` est de la prose figée qui nomme `/investigate`, `/diagnosing-bugs`,
`/superpowers:systematic-debugging` en dur. Le catalogue **filtrait** cette prose, il ne pouvait
pas l'étendre. Quelqu'un dont les packs diffèrent gardait la méthode — situer, soustraire, nommer
les exclusions — et perdait l'arbitrage, qui est le service principal. Et rien ne le lui disait.

## La chose qu'on n'a pas faite, et pourquoi

**Dériver l'arbitrage du catalogue.** Trancher entre `/investigate` et `/diagnosing-bugs` demande
de savoir que l'un refuse de théoriser avant une commande rouge et que l'autre est branché sur
`/freeze` et `/ship`. Une ligne de `description:` ne porte pas ça. Un verdict généré serait
exactement la sortie assurée et creuse que ce skill existe pour empêcher.

## Ce qui a changé

| Fichier | Nature du changement |
|---|---|
| `scripts/build-catalogue.sh` | Détection de recouvrement non arbitré, en fin de catalogue |
| `SKILL.md` | Lit `arbitration.local.md` ; annonce le trou au lieu de choisir en silence |
| `.gitignore` | `references/arbitration.local.md` |
| `README.md` | Section « Arbitrating your own duplicates » |
| `scripts/run-evals.py` | Correction d'une affirmation fausse dans la docstring |

### 1. Le trou est détectable, lui

Le générateur compare les skills installés à ce que l'arbitrage couvre, et ajoute :

```
## Possible unarbitrated overlap

### review — 3 installed, 1 arbitrated
- `/review`
- `/superpowers:receiving-code-review`
- `/postgresql-code-review`
```

Un vrai cas sur la machine de l'auteur. Le terrain `debug` reste muet : ses trois concurrents sont
déjà argumentés, donc aucun signal — c'est le comportement voulu.

La détection est par mots-clés sur les descriptions, donc grossière, et l'en-tête le dit :
**signal, pas verdict**. Un recouvrement manqué ne coûte rien ; un recouvrement affirmé à tort
coûterait la confiance.

### 2. Et on peut le combler soi-même

`references/arbitration.local.md`, ignoré par git, lu à côté du fichier livré et prioritaire sur
lui pour tout skill que les deux mentionnent. Vérifié : en écrire un fait taire le signal du
terrain concerné.

Les deux ne valent qu'ensemble. Le signal seul frustre ; le fichier local seul ne se déclenche
jamais, faute de savoir qu'il manque quelque chose.

### 3. Une affirmation fausse retirée

Le README et la docstring du runner affirmaient que les évals ne dépendent pas de ce qui est
installé. Mesuré, et faux : l'agent sous-jacent voit les skills réels de la machine et route
dessus de préférence — interrogé avec une fixture modifiée, il l'a écrit noir sur blanc,
*« j'ai donc routé sur la liste de skills réellement chargée dans la session »*. Les 18 assertions
passent toujours, mais un run vert sur une machine ressemblant à la fixture prouve moins qu'il n'y
paraît. Les deux fichiers le disent désormais.

## Vérification

| Contrôle | Résultat |
|---|---|
| Recouvrement détecté sur la machine réelle | terrain `review`, 3 installés, 1 arbitré |
| Arbitrage local écrit | le signal se tait |
| Compteur de skills | 126 → 123 (la section d'overlap le gonflait) |
| Machine vierge | 0 skill, 4 sections, **code de sortie 0** |
| Machine réelle | 123 skills, **code de sortie 0** |
| Évals après modification de `SKILL.md` | 18/18 |

### Ce que la CI a attrapé, et ce qu'elle ne pouvait pas

`shellcheck` a signalé **SC2094** — le bloc lisait `$OUT` alors que sa propre sortie y était
redirigée, soit un fichier lu et écrit dans le même pipeline. Ça marche tant que la sortie est
petite et cesse d'être vrai sans prévenir. Corrigé par un fichier temporaire.

**SC2001** a révélé un motif échappé puis déséchappé, deux opérations qui s'annulent.

Deux **SC2016** sur des scripts `sed` sont des faux positifs, supprimés avec le motif.

Et deux bugs de code de sortie que `shellcheck` ne voit pas, sur le chemin de la machine vierge :
refactorer le compteur en `n=$(... | grep -c ...)` faisait remonter le statut de `grep`, qui sort
en 1 quand il ne compte rien — donc une installation neuve sans skills échouait sur un résultat
légitime. L'ancienne forme, à l'intérieur d'un `echo`, masquait ce statut. Le `grep -q ... && echo`
final avait la même forme.

## PR

https://github.com/whichskill/whichskill/pull/9 — **mergée** (merge commit `e557cca`), branche
supprimée. CI verte.

## Points de suivi

1. **La détection par mots-clés reste grossière.** Les huit terrains sont des heuristiques écrites
   à la main. Un terrain manqué est silencieux — c'est le mode de défaillance acceptable, mais il
   existe.
2. **Le signal ne remonte pas en amont.** Si beaucoup d'installateurs voient le même recouvrement
   non arbitré, rien ne le fait savoir à l'auteur. C'est pourtant exactement la liste des
   arbitrages qui manquent.
3. **La distribution** : `ComposioHQ/awesome-claude-skills#1636` toujours ouverte.

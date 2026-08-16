# PR #15 — Corriger ce que la revue a trouvé, et rendre deux règles mécaniques

## Contexte

Un agent de revue adverse a confronté le skill aux trois règles que `CLAUDE.md` déclare porteuses.
**Deux étaient enfreintes dans la prose livrée.** J'ai revérifié chaque trouvaille avant de corriger ;
aucune n'a été reprise sur parole.

## Le skill enfreignait sa propre règle la plus citée

`SKILL.md` : *« Three to seven steps. Past seven, you did not do step 2. »* Sur 36 chaînes
canoniques, **six dépassaient**. Une en comptait quatorze.

Le point qui rend cela grave : `SKILL.md:52` envoie le modèle lire `chains.md` comme canon de
départ. Les chaînes les plus longues **enseignaient donc le remplissage** que le premier paragraphe
du README promet de supprimer.

Les six sont ramenées dans le plafond. Ce qui a été retiré passe dans la note sous chaque chaîne,
pas à la poubelle. La chaîne à quatorze étapes devient **trois phases**, et le routeur répond avec
la phase où la personne se trouve. Une feuille de route n'est pas une chaîne : personne n'agit sur
une feuille de route cet après-midi.

## Un nom qui n'existe pas

`chains.md` nommait `code-simplifier`. Vérifié à la main : aucun `SKILL.md` sous `~/.claude/skills`,
`~/.agents/skills`, ni dans aucun répertoire `skills/` de plugin. C'est un **agent** de plugin.
Aucun catalogue généré ne peut le contenir, donc le routeur envoyait vers une commande que personne
ne possède.

## Deux règles qui se combattaient

`/compact` est le défaut déclaré du passage de relais et une **commande native du harnais**. Elle ne
peut jamais figurer dans un catalogue. Or la règle dure dit qu'un nom absent du catalogue n'existe
pas. Le modèle devait désobéir à l'une des deux.

`SKILL.md` ménage désormais une exception explicite pour les commandes natives, et pour elles seules.

## Un arbitrage qui plaidait contre son verdict

> **`/tdd`** si `/implement` est dans la chaîne — *parce que* mélanger les deux met deux disciplines
> concurrentes sur le même diff.

Les deux puces étant conditionnelles, le terrain n'avait **aucun gagnant inconditionnel**. Cinq
chaînes contiennent `/tdd` sans qu'aucune condition ne s'applique. Réécrit avec un vrai défaut.

Aussi : `/careful` perdait face à `/guard` **sans ligne « quand il gagne »** (règle 3), et le terrain
« Routing » n'avait pas de défaut et omettait `/which-skill` — le seul terrain où ce skill est
lui-même en concurrence.

## L'étape obligatoire ne pouvait pas s'exécuter

`SKILL.md` demandait de lancer `scripts/build-catalogue.sh`, un chemin **relatif**, alors que le
répertoire de travail du modèle est le projet de la personne. C'est l'étape que le README qualifie
de « not optional ». Elle est désormais absolue, avec le chemin `npx skills` nommé aussi.

## Correctifs de script et de documentation

| Défaut | Effet |
|---|---|
| Le détecteur de recouvrement comparait en **sous-chaîne** | `/review` matchait dans `/review-animations` |
| Il ratait les noms superpowers | le catalogue préfixe un `/` que la prose n'écrit pas |
| Catalogue à zéro skill écrit **en silence** | routeur confiant qui croit que rien n'est installé |
| Glob superpowers lexical | avec deux versions installées, l'**ancienne** description gagnait |
| Un `\|\| true` dit indispensable | il ne l'est pas : un `if` sans `else` retourne 0 |
| `CLAUDE.md` et `site/index.html` | décrivaient encore un marqueur `NOT GENERATED` et un garde CI inverse du vrai |

Le commentaire sur le `|| true` était de moi. Je l'avais raisonné au lieu de l'exécuter — la faute
exacte que ce dépôt attrape depuis le début.

Après correction, le détecteur fait taire `tdd` et `framing`, qui sont réellement arbitrés, et
continue de signaler `review`, qui ne l'est réellement pas.

## Deux règles cessent de dépendre de ma discipline

**La CI compte les étapes.** Une chaîne au-delà de sept fait échouer la construction, avec le
fichier et la ligne.

**`build-catalogue.sh --audit`** rapporte chaque nom de la prose non installé sur cette machine.
C'est le contrôle qui aurait attrapé `code-simplifier` le jour où il a été écrit.

Il exige un `/` initial ou un préfixe `plugin:`, pour que les commandes shell citées dans la prose
restent dehors. Première version : elle signalait `rm`, tiré de ma propre phrase sur `/careful`. Un
audit qui crie au loup est un audit qu'on cesse de lire.

## Vérification

| Contrôle | Résultat |
|---|---|
| 39 chaînes, toutes ≤ 7 étapes | oui |
| Occurrences de `code-simplifier` | 0 |
| Suite d'évals | **23/23** sur 5 évals (avant : 18/18 sur 4) |
| Machine réelle / machine vierge | code 0 dans les deux cas |
| Audit sur la prose actuelle | propre |
| Audit avec un faux nom injecté | attrapé |
| `bash -n` | OK |
| CI | verte au second essai |

La CI a d'abord échoué sur un **SC2016**, un faux positif : shellcheck voit les backticks dans des
guillemets simples et croit à une substitution de commande. Ce sont des caractères littéraux du
motif `grep`. Supprimé avec le motif écrit.

J'ai relu le log du runner pour vérifier que les nouvelles étapes **s'exécutent** : `every chain is
within the ceiling` et `moved your arbitration out of the skill folder` apparaissent bien. Un test
vert qui n'a rien exécuté ne prouve rien.

L'éval 4 est nouvelle et n'existe que pour garder `code-simplifier` dehors. Les évals 0 et 1
reçoivent le plafond de sept étapes — la règle enfreinte six fois sans qu'aucune assertion ne
regarde.

## PR

https://github.com/OmarBenje/whichskill/pull/15 — **mergée** (squash, `4d4dda8`), branche supprimée.

## Points de suivi

1. **L'audit sous-déclare volontairement.** Un skill écrit sans slash ni préfixe de plugin, comme
   `git-guardrails-claude-code`, n'est pas contrôlé. C'est le compromis choisi contre les faux
   positifs ; il est écrit dans le code.
2. **La règle 1 reste invérifiable en CI.** Le runner n'a aucun skill installé, donc seul l'auteur
   peut lancer l'audit. Un nom inventé passe encore si personne ne le fait tourner.
3. **Les autres trouvailles « suspectées » de la revue** n'ont pas été traitées : la clé de dédoublonnage
   `awk $2` sur un nom de dossier contenant des espaces, et l'invisibilité structurelle des commandes
   natives de Claude Code (`/security-review`, `/init`) que le générateur ne peut pas lister.
4. **La distribution.** `ComposioHQ/awesome-claude-skills#1636` toujours ouverte ; le formulaire de
   `claudeskills.info/submit/` reste une action humaine.

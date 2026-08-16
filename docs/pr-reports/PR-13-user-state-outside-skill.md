# PR #13 — Sortir l'arbitrage personnel de la portée des mises à jour

## Contexte

Recherche demandée : regarder comment gstack et la suite Matt Pocock s'installent et se mettent à
jour, et s'en inspirer. Cinq lecteurs, sources primaires lues **sur le disque** (les deux packs sont
installés sur cette machine) plutôt que dans leur documentation.

La comparaison a produit un tableau où `which-skill` était le seul cas isolé :

| | où vit l'état utilisateur |
|---|---|
| gstack | `~/.gstack/config.yaml` |
| suite Matt Pocock | le `docs/agents/` du dépôt cible |
| which-skill (avant) | **le dossier du skill, là où passe l'updater** |

## Le défaut, trouvé en exécutant

Expérience en dépôt jetable : installer via `npx skills`, générer le catalogue, écrire un
`references/arbitration.local.md`, lancer `npx skills update`.

```
avant :  arbitration.local.md  arbitration.md  catalogue.md  chains.md
après :                        arbitration.md                chains.md
```

`npx skills update` **remplace le dossier du skill par l'amont**. Sans avertissement, sans `diff`,
sans sauvegarde.

Deux pertes de nature différente :

- **Le catalogue** — non-événement. `SKILL.md` ligne 16 constate son absence et le régénère.
- **L'arbitrage écrit à la main** — irrécupérable. Personne ne peut le reconstituer.

Et c'est la voie que les annuaires vont alimenter : `npx skills add whichskill/whichskill`
fonctionne depuis la correction du frontmatter (PR #6), et le README n'en disait pas un mot.

## Ce qui a changé

| Fichier | Nature |
|---|---|
| `scripts/build-catalogue.sh` | `~/.which-skill/arbitration.local.md` ; migration depuis l'ancien chemin |
| `SKILL.md` | lit le nouveau chemin, sait quoi dire s'il trouve l'ancien |
| `README.md` | voie `npx` documentée ; les deux mises à jour distinguées |
| `.gitignore` | l'ancien chemin reste ignoré, pour ceux qui en ont un |
| `.github/workflows/ci.yml` | étape reproduisant migration et collision ; deux gardes fusionnés |
| `docs/research/setup-and-update-patterns.md` | la recherche |

`WHICH_SKILL_HOME` permet de surcharger l'emplacement, comme `CLAUDE_SKILLS_DIR` le fait déjà.

**En cas de collision** — un fichier aux deux endroits — le script signale et **n'écrase ni l'un ni
l'autre**. Deux arbitrages est une situation que seul leur auteur peut trancher.

## Vérification

| Contrôle | Résultat |
|---|---|
| Migration depuis l'ancien chemin | déplacé, arrive intact, rien ne reste derrière |
| Collision, les deux chemins remplis | signalée, aucun des deux écrasé |
| L'arbitrage au nouveau chemin fait taire le signal de recouvrement | oui |
| Machine vierge (0 skill) | code 0 |
| `bash -n` | OK |
| Évals après modification de `SKILL.md` | 18/18 |
| CI (`verify` + Cloudflare Pages) | verte |

La nouvelle étape CI a été vérifiée dans le log du runner, pas seulement à son code de sortie —
elle imprime bien `moved your arbitration out of the skill folder` sur une machine vierge. Un test
qui passe sans rien exécuter est le seul résultat vert qui ne prouve rien.

## Ce que la recherche a rapporté d'autre

**À prendre chez gstack.** Le contrôle de version résout d'abord le SHA vivant
(`git ls-remote refs/heads/main`) puis lit une URL raw épinglée à ce SHA, parce que le CDN de GitHub
sert du contenu périmé plusieurs minutes après un push — ce qui faisait annoncer « up to date »
juste après une release. `sort -V` refuse une mise à jour vers l'arrière. Et un `trap ... ERR`
transforme tout plantage en `CHECK_FAILED ... status UNKNOWN, not up-to-date` : le code cite
l'incident, 45 versions de retard invisibles parce qu'un crash ressemblait à « à jour ».

**À ne pas prendre.** Le système de templates. Mesuré sur `design-consultation` : 9 554 octets de
template produisent 69 022 octets générés, soit **86 % de boilerplate injecté**. Cette machinerie
amortit de la prose partagée entre des dizaines de skills et plusieurs hôtes. Un dépôt à un skill
n'a rien à amortir.

**Chez Matt Pocock.** `disable-model-invocation: true` empêche le skill de configuration de se
déclencher sur une correspondance sémantique — un assistant qui réécrit des fichiers de config ne
doit pas partir tout seul sur les mots « configure ce projet ». Et la dégradation y est **graduée
par écrit** : signaler ce qui est requis (`code-review` nomme le fichier manquant et le skill qui le
crée), se taire sur ce qui est optionnel (`domain.md` : *« proceed silently, don't flag their
absence »*).

## Une tension assumée

La PR #11 a retiré 428 lignes de recherche parce que tout ce qui est commité atterrit chez
l'installateur. Celle-ci en rajoute 145. Elles ne se justifient que parce que la recommandation
n°1 de la note est appliquée dans la même PR — la note est la démonstration du correctif, pas un
document annexe. Si le correctif avait été refusé, la note n'avait pas sa place ici.

## PR

https://github.com/whichskill/whichskill/pull/13 — **mergée** (squash, `11f31e7`), branche supprimée.

## Points de suivi

1. **La portée globale de `npx skills update` n'a pas été testée** — l'expérience a tourné en portée
   projet (`-p`) dans un dépôt jetable, pour ne pas toucher aux 48 skills installés de cette machine.
   Rien n'indique un traitement différent ; ce n'est pas vérifié.
2. **Le rôle exact de `skillFolderHash`** dans `~/.agents/.skill-lock.json` reste inconnu. Le fait
   observé est que l'update écrase sans prévenir ; le mécanisme derrière n'est pas établi.
3. **La péremption du catalogue** — idée n°3 de la note, non implémentée. Le catalogue porte déjà
   `Last generated: DATE` ; `SKILL.md` pourrait demander de régénérer au-delà de N jours. Coût nul,
   bénéfice modeste.
4. **La distribution.** `ComposioHQ/awesome-claude-skills#1636` toujours ouverte. La soumission à
   `claudeskills.info/submit/` reste une action humaine — et elle est maintenant plus sûre à faire,
   puisque la voie `npx` ne détruit plus le travail de personne.

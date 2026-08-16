# Comment gstack et la suite Matt Pocock s'installent et se mettent à jour

Recherche du 2026-08-16. Tier standard : cinq lecteurs indépendants, sources primaires **lues sur le
disque** (les deux packs sont installés sur cette machine) plutôt que dans la documentation, plus
quatre vérifications exécutées en direct — dont une expérience en bac à sable qui a trouvé un défaut
réel de `which-skill`.

## Verdict

Les deux packs répondent à des questions différentes, et **aucun des deux ne met son état
utilisateur dans le dossier du skill**. C'est la seule chose que `which-skill` fait autrement, et
c'est précisément ce qui casse.

| | gstack | Matt Pocock | which-skill (aujourd'hui) |
|---|---|---|---|
| Unité livrée | 1 dépôt → ~111 skills | 1 dépôt → N skills indépendants | 1 dépôt = 1 skill |
| Installation | `git clone && ./setup` | `npx skills add mattpocock/skills` | `git clone` (documenté), `npx skills add` (non documenté, fonctionne) |
| Mise à jour | auto, à chaque session | `npx skills update` | `git pull` |
| Versionné ? | `VERSION` 4 segments + CHANGELOG | rien dans le skill ; lock file de l'installeur | non |
| Ce que le setup configure | **la machine** (`~/.gstack/`) | **le dépôt** (`docs/agents/`) | **la machine** (`references/catalogue.md`) |
| Où vit l'état utilisateur | `~/.gstack/config.yaml` — hors du skill | `<repo>/docs/agents/` — hors du skill | **dans le dossier du skill** ⚠️ |

## Le défaut trouvé en exécutant

Expérience : installer `which-skill` via `npx skills` dans un dépôt jetable, générer le catalogue,
écrire un `references/arbitration.local.md`, lancer `npx skills update`.

```
avant update:  arbitration.local.md  arbitration.md  catalogue.md  chains.md
après update:                        arbitration.md                chains.md
```

`npx skills update` **remplace le dossier par l'amont**. Le catalogue généré disparaît — supportable,
il se régénère. **L'arbitrage écrit à la main disparaît aussi** — et lui, personne ne le récupère.
Aucun avertissement, aucun `diff`, aucune sauvegarde.

Deux conséquences immédiates :

1. Le README affirme « Your generated catalogue is ignored by git, so it survives the pull
   untouched ». **Vrai pour `git pull`, faux pour `npx skills update`** — et c'est cette voie-là que
   la PR chez Composio et la soumission à claudeskills.info vont alimenter.
2. Le skill s'auto-répare pour le catalogue : `SKILL.md` ligne 16 dit de régénérer s'il manque. Il
   ne s'auto-répare pas pour l'arbitrage local, qui est par nature irremplaçable.

Vérifié aussi : `npx skills add whichskill/whichskill` copie **tout le dépôt**, 140 Ko, y compris
`.github/workflows/ci.yml`, `site/index.html` et les six rapports de PR. La correction du YAML
(PR #6) tient — l'install échouait avant, elle passe maintenant.

## Ce que gstack fait, et ce qui se transpose

**Le contrôle de mise à jour tourne au préambule de *chaque* skill**, throttlé par le mtime de
`~/.gstack/last-update-check` : TTL de 60 min si à jour, 720 min si une version attend (pour
continuer à relancer sans harceler).

La comparaison de version est plus soignée qu'attendu. Plutôt que de lire l'URL raw d'une branche,
elle résout d'abord le SHA vivant :

```bash
git ls-remote "$REMOTE_REPO" refs/heads/main      # HEAD réel, jamais en cache
_SHA_URL="https://raw.githubusercontent.com/garrytan/gstack/${_REMOTE_SHA}/VERSION"
```

Le commentaire dit pourquoi : le CDN raw de GitHub sert du contenu périmé plusieurs minutes après un
push, ce qui faisait dire « up to date » juste après une release. Les URL épinglées au SHA sont
immédiatement cohérentes.

Deux gardes valent d'être notées :

- `sort -V` refuse une régression : si l'amont paraît *plus ancien*, on ne propose pas de
  « mise à jour » vers l'arrière.
- Un `trap ... ERR` transforme tout crash en `CHECK_FAILED ... update status UNKNOWN, not
  up-to-date` plutôt qu'en silence. Le code cite l'incident : 45 versions de retard sans que
  personne le voie, parce qu'un plantage était indistinguable de « à jour ».
- `GIT_TERMINAL_PROMPT=0` et un timeout bas-débit de 5 s, pour qu'« un réseau instable ou un portail
  captif ne puisse pas geler le préambule de chaque skill ».

**Ce qui ne se transpose pas** : la matrice de détection du type d'installation
(global-git / local-git / vendored), les scripts de migration par version, la détection d'hôte
(10 agents), le mode `--team` avec son hook `PreToolUse` qui bloque les coéquipiers non équipés.
Tout cela existe parce que gstack est un monolithe de 111 skills avec des binaires.

**Le système de templates : à ne pas copier.** Chaque `SKILL.md` est généré depuis un `SKILL.md.tmpl`
par un registre de résolveurs TypeScript en `{{PLACEHOLDER}}`, résolus en jusqu'à six passes. Mesuré
sur `design-consultation` : 9 554 octets de template → 69 022 octets générés, soit **86 % de
boilerplate injecté**. Cette machinerie amortit des milliers de lignes de prose de sécurité
partagées entre des dizaines de skills et plusieurs hôtes. Un dépôt à un skill n'a rien à amortir.
La seule idée conceptuellement voisine — générer puis vérifier que rien n'a dérivé — `which-skill`
la tient déjà, en moins cher, avec le marqueur `NOT GENERATED` et le garde CI.

## Ce que fait Matt Pocock, et ce qui se transpose

**Le setup configure le dépôt, pas la machine.** `setup-matt-pocock-skills` écrit exclusivement dans
le dépôt cible : `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`, plus une section
dans le `CLAUDE.md` du projet. Rien sous `~/.claude`.

**`disable-model-invocation: true`** dans son frontmatter : le skill ne peut pas être déclenché par
correspondance sémantique, seulement appelé explicitement. C'est cohérent — un assistant qui
déclencherait tout seul un assistant d'écriture de configuration sur les mots « configure ce
projet » réécrirait silencieusement des fichiers.

**La dégradation est graduée, et écrite.** `code-review/SKILL.md` : *« The issue tracker should have
been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is
missing. »* Et le fichier généré `domain.md` instruit l'inverse pour les docs de domaine :
*« If any of these files don't exist, proceed silently. Don't flag their absence. »* Deux régimes
délibérés : signaler ce qui est requis, se taire sur ce qui est optionnel.

**Aucun mécanisme de version dans le skill.** Pas de `VERSION`, pas de `CHANGELOG`, pas de `.git`.
La mise à jour appartient entièrement à l'installeur externe : `~/.agents/.skill-lock.json`
(48 entrées sur cette machine) avec `source`, `sourceUrl`, `skillFolderHash`, `installedAt`,
`updatedAt`, et des symlinks depuis `~/.claude/skills/<nom>` vers `~/.agents/skills/<nom>`.

C'est un choix, pas un oubli : le skill reste de la prose pure, et la plomberie vit ailleurs.

## Recommandations, par ordre de valeur

**1. Sortir l'état utilisateur du dossier du skill.** C'est le point où les deux packs sont d'accord
contre nous : gstack met sa configuration dans `~/.gstack/`, Matt Pocock dans `<repo>/docs/agents/`,
et ni l'un ni l'autre ne laisse quoi que ce soit de personnel là où l'updater passe. `which-skill`
met les deux — le catalogue généré *et* l'arbitrage manuscrit — exactement là où `npx skills update`
efface. Déplacer `arbitration.local.md` vers `~/.which-skill/` supprime la perte de données quelle
que soit la voie d'installation. Le catalogue peut suivre ou rester : il se régénère.

**2. Documenter la seconde voie d'installation, et son coût.** `npx skills add whichskill/whichskill`
marche et sera la voie majoritaire une fois le dépôt indexé. Le README n'en dit rien et affirme, sur
la foi de `git pull`, une durabilité qui ne tient pas là. Deux lignes de README et un avertissement.

**3. Une péremption du catalogue, à coût nul.** Le catalogue porte déjà `Last generated: DATE`.
`SKILL.md` peut demander de régénérer au-delà de N jours. C'est la version pauvre du contrôle de
gstack, sans appel réseau, sans throttle, sans trap — et c'est proportionné : un catalogue périmé
fait recommander un skill désinstallé, pas planter une session.

**4. Ne pas faire** : le système de templates, les migrations par version, le mode équipe, le
contrôle de version en ligne. Coût réel, bénéfice nul à cette taille.

## Limites

- La cadence du CHANGELOG de gstack n'a pas été lue ; le lecteur web l'a signalée non couverte.
- Le chemin d'installation « plugin marketplace » de Matt Pocock (alternative au `npx skills`) n'a
  pas été vérifié en direct, seulement résumé.
- L'expérience `npx skills update` a été menée en **portée projet** (`-p`) dans un dépôt jetable. La
  portée globale (`-g`) n'a pas été testée, pour ne pas toucher aux 48 skills installés de cette
  machine. Rien n'indique un traitement différent, mais ce n'est pas vérifié.
- `skillFolderHash` existe dans le lock file ; je n'ai pas déterminé s'il sert à *détecter* une
  modification locale. L'observation est que l'update écrase sans prévenir — le mécanisme exact
  derrière n'est pas établi.

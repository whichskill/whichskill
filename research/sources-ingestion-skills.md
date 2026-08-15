# Faisabilité — ingestion machine d'un inventaire large de skills

Recherche du 2026-08-15. Étude de faisabilité, pas un survol : chaque chiffre ci-dessous vient
d'une commande exécutée en direct (`git clone`, `curl`, `jq`, `npm view`, `npx`), pas d'un résumé
de recherche web. Les commandes exactes sont données pour permettre la reproduction.

## Verdict en trois lignes

**Oui, un inventaire large est ingérable dès aujourd'hui, mais pas via `marketplace.json`.**
Le manifeste officiel liste des *plugins* (286 chez Anthropic), pas des skills : l'écrasante
majorité des skills qu'il référence vivent dans des dépôts tiers non énumérés par le fichier
lui-même. La route qui marche est double : l'**API JSON de claudeskills.info**
(14 989 items, sans authentification, testée en direct) pour la largeur, et le **CLI npm `skills`**
de Vercel (`npx skills add <owner>/<repo> --list`, testé en direct sur un vrai dépôt) pour
extraire proprement nom + description de n'importe quel dépôt cible. Aucune source ne fournit à
la fois la largeur et une licence de republication propre : le corpus le plus large
(ComposioHQ, 864 SKILL.md vérifiés) republie sans licence des skills propriétaires d'Anthropic
verbatim — un piège de conformité concret, démontré ci-dessous, pas supposé.

## Le manifeste marketplace.json — ce qu'il est vraiment

Source : [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
et [Plugins reference](https://code.claude.com/docs/en/plugins-reference) (redirigées depuis
docs.claude.com, lues verbatim, pas résumées).

- **Chemin** : `.claude-plugin/marketplace.json` à la racine du dépôt.
- **Champs requis** : `name` (string), `owner` (objet avec `name` requis, `email`/`url` optionnels),
  `plugins` (array). Chaque entrée de `plugins` requiert `name` + `source`.
- **Champs optionnels par plugin** : `description`, `version`, `author`, `homepage`, `repository`,
  `license`, `keywords`, `category`, `tags`, `strict`, `relevance`, et les champs de composants
  (`skills`, `commands`, `agents`, `hooks`, `mcpServers`, `lspServers`).
- **Point critique pour l'ingestion** : le champ `skills` (chemin vers un dossier `<name>/SKILL.md`)
  est **optionnel et rarement rempli**. Par défaut, Claude Code auto-découvre les skills en
  scannant un dossier `skills/` dans la source du plugin — un dossier que le manifeste
  `marketplace.json` ne décrit pas. **Un programme qui lit seulement `marketplace.json` obtient
  une liste de plugins (nom, description, catégorie, source), jamais une liste de skills.** Pour
  obtenir les skills, il faut cloner ou télécharger chaque source de plugin et parcourir son
  arborescence — 286 fetches distincts pour le seul dépôt officiel.
- Liste de noms de marketplace réservés à Anthropic (`claude-plugins-official`,
  `agent-skills`, etc.) — confirme que c'est une convention gouvernée, pas une norme ouverte.

## Tableau par source

| Source | Artefact machine-readable | Compte vérifié | Licence source / description | Identifiants | Fraîcheur |
|---|---|---|---|---|---|
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | `.claude-plugin/marketplace.json`, clonable | **286 plugins** (jq sur le JSON cloné). 53 sources relatives (in-repo), 83 `git-subdir`, 150 `url` externes. Seuls 40 `plugin.json` / 31 `SKILL.md` existent *dans ce dépôt* — le reste vit ailleurs, non énuméré | Dépôt Apache-2.0 (LICENSE lu) ; champ `license` par plugin présent dans le schéma mais **`null` sur les 286 entrées** | `name` unique dans ce marketplace seulement ; carte `renames` de 9 entrées prouve que les noms bougent dans le temps | 10 commits en ~3h le jour du test — pipeline quasi continu, bot-alimenté |
| [anthropics/skills](https://github.com/anthropics/skills) | Dépôt clonable + `marketplace.json` propre (3 plugins déclarant `skills` explicitement) | **18 `SKILL.md`** (1 template + 17 réels) = 4+12+1 dans les 3 plugins déclarés, recoupé | Mixte **vérifié skill par skill** : 4 skills (docx/pdf/pptx/xlsx) `license: Proprietary` dans le frontmatter, `LICENSE.txt` lu verbatim (interdit extraction, redistribution, dérivés) ; 13 autres Apache-2.0 (`LICENSE.txt` confirmé Apache) | Pas d'id central ; `name` frontmatter unique dans ce dépôt seulement | 10 commits du 09/06 au 13/08/2026 — environ toutes les 1-3 semaines |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | Dépôt clonable | **864 `SKILL.md`** (`find`, exact) contre un « 1000+ » revendiqué dans le README — **à traiter comme claimed, l'écart n'est pas expliqué**. 834/864 (96,5 %) sont des stubs `composio-skills/*-automation` générés, dépendant du MCP propriétaire Rube de Composio | Badge README « Apache-2.0 » **mais aucun fichier LICENSE dans le dépôt** (`find` négatif). Copie verbatim du skill `pdf` d'Anthropic — `diff` sur `LICENSE.txt` : **identique, exit 0** — donc republication d'un contenu marqué propriétaire sans licence propre visible | Slug = nom de dossier, aucun espace de noms ; collision avérée avec `skill-creator` d'anthropics/skills (contenu différent, même nom) | pushed_at 2026-08-10 |
| [claudeskills.info](https://claudeskills.info) | **API JSON REST**, `GET /api/v1/{meta,search,items/{slug}}`, sans auth, CORS `*`, documentée sur `/llms.txt` | **14 989 items / 3 830 dépôts uniques** (`/api/v1/meta`, testé en direct). Répartition : skill 11 352 (193 en dédup-par-dépôt), subagent 2 179, plugin 909, command 467, hook 25, memory-tool 21, automation 18. 383 featured | Site = agrégateur de métadonnées d'autrui ; expose slug/nom/description/catégorie/source, pas de champ `license` ni `author` | `slug`, dédupliqué par le site avec suffixe numérique sur collision (`code-review-14`, `code-reviewer-8`, `skill-creator-pro`) — la clé réelle est `(source.repo, path)` | Cache 5 min ; `stars` en léger retard sur le direct (246 325 affiché vs 272 178 réel via l'API GitHub pour obra/superpowers) |
| [skills.sh](https://skills.sh) + `npm i skills` | CLI npm **`skills`** (pas `skills-sh`), v1.5.22, mainteneur `vercel-labs`, testé en direct | Sitemap : **20 000 URLs de skills** (2 fichiers à 10 000, plafond du protocole — borne basse), 16 653 pages « owner ». API REST documentée (`/api/v1/skills`, `/search`, `/curated`) mais **bloquée** — voir « Ce qui bloque » | Outil CLI MIT (`vercel-labs/skills`) ; contenu récupéré hérite de la licence du dépôt source, non relicencié par skills.sh | Adressage `{owner}/{repo}@{skill-slug}` — portable, résistant aux collisions, réutilisable comme modèle | Dépôt poussé 2026-08-14, très actif |
| [agensi.io](https://agensi.io) | Sitemap XML seulement, pas d'API (`/api/` et `/skill/` interdits par robots.txt) | 4 223 URLs au total, dont **3 381 pages `/skills/<slug>`** vérifiées par grep | Aucune licence de contenu affichée ; page skill échantillon = HTML 441 Ko, JSON-LD limité au schéma `Organization`, pas de données structurées par skill | Slug de page uniquement | Non vérifié (pas de date de dernière modification dans le sitemap) |
| [agentskills.io](https://agentskills.io) | Sitemap XML | **9 pages au total**, exclusivement documentation (spec, quickstart, clients) — **aucune page de skill** | Spécification du format, pas un annuaire | N/A | `lastmod` sitemap 2026-08-09 pour la page d'accueil |
| [obra/superpowers](https://github.com/obra/superpowers) | Dépôt clonable, `marketplace.json` + `plugin.json` propres | **14 `SKILL.md`** (`skills/<nom>/SKILL.md`, `find` exact) | MIT (dépôt + `plugin.json`) | `name` unique dans ce dépôt | pushed_at 2026-08-13 ; 272 178 stars (vérifié API GitHub) |
| [garrytan/gstack](https://github.com/garrytan/gstack) | Dépôt clonable (voir note opérationnelle) — **pas de `marketplace.json`/`plugin.json`** | **61 `SKILL.md`** (`find` exact, un dossier top-level par skill, hors convention `skills/`) | MIT (LICENSE lue) | `name` frontmatter, pas de namespace | pushed_at 2026-08-14 |

## La route recommandée

Le pipeline concret, dans l'ordre, avec les commandes qui ont déjà fonctionné :

1. **Largeur d'abord — claudeskills.info comme index de découverte.**
   `curl "https://claudeskills.info/api/v1/search?type=skill&limit=100&offset=N"` en boucle
   d'offset donne les 3 830 dépôts sources avec leur URL GitHub. Zéro authentification, testé.
   C'est une carte des sources, pas le contenu — chaque item ne porte que `slug/name/description
   courte/source.url/stars`.

2. **Extraction du contenu réel — le CLI `skills` sur chaque source.**
   Pour chaque `source.repo` distinct retourné à l'étape 1 :
   `npx skills@1.5.22 add <owner>/<repo> --list`
   Commande testée en direct sur `vercel-labs/agent-skills` : retour de 9 skills avec nom et
   description complète, en ~15 secondes, sans clonage manuel. C'est le seul outil des neuf qui
   fait exactement ce qu'un pipeline d'ingestion veut : `name` + `description` propres, pour
   n'importe quel dépôt Git, sans dépendre d'un index central.

3. **Skills « source » en clone direct.** `git clone --depth 1
   https://github.com/anthropics/skills` puis `find . -iname SKILL.md` pour les 17 skills de
   référence — et pour claude-plugins-official, parser `.claude-plugin/marketplace.json` avec
   `jq`, puis suivre chaque `source.git-subdir`/`source.url` (286 fetches, à mettre en file avec
   backoff — débit non testé à ce volume).

4. **Déduplication par `(source.repo, chemin)`, jamais par nom.** Les collisions sont la norme,
   pas l'exception (`code-review` trouvé sous sept graphies différentes dans un seul `curl`).
   L'id `id: "pack/skill"` déjà utilisé dans `src/data/skills.json` du projet va dans le bon sens
   — il suffit d'ajouter le dépôt source dans la clé pour les entrées ingérées automatiquement.

5. **Ne jamais copier une `description` verbatim sans vérifier la licence du dépôt source**
   (voir Licences ci-dessous) — écrire une description propre à partir des faits (nom, catégorie,
   URL source) plutôt que de recopier le texte de l'auteur.

## Ce qui bloque

- **skills.sh, API REST** — `curl "https://skills.sh/api/v1/skills"` renvoie
  `401 {"error":"authentication_required", ...Vercel OIDC token...}` sur les trois endpoints
  testés (`/skills`, `/skills/curated`, `/skills/search`). Bloqué pour un appelant anonyme non
  déployé sur Vercel — pas contournable pour un pipeline externe.
- **agensi.io, contenu par skill** — pas de blocage réseau (200 partout), mais pas d'API :
  chaque skill nécessite un scrape HTML de 441 Ko par page pour ~3 381 pages, sans donnée
  structurée exploitable dans l'échantillon lu. Faisable mais coûteux, pas dans le budget de
  cette étude.
- **agentskills.io comme index** — n'est pas bloqué, n'a simplement rien à donner : 9 pages, zéro
  skill. Confirme la lecture de la recherche précédente (`etape-0`) : c'est l'hôte de la
  spécification, pas un annuaire.
- **`git clone` sur garrytan/gstack** — deux tentatives (`timeout 20`/`30`) ont expiré (code 124).
  Contournement : `curl` du tarball `codeload.github.com/garrytan/gstack/tar.gz/refs/heads/main`
  avec un timeout de 90 s a fonctionné (13 Mo). Symptôme réseau ponctuel probable, pas une
  caractéristique du dépôt — à re-tester avant d'automatiser.

## Licences

À traiter de façon conservatrice, en distinguant trois couches :

1. **Licence du dépôt source.** Vérifiée dépôt par dépôt : Apache-2.0 (claude-plugins-official),
   MIT (superpowers, gstack, vercel-labs/skills), mixte skill-par-skill (anthropics/skills),
   **aucune** (ComposioHQ malgré le badge — pas de fichier LICENSE trouvé par `find`).
2. **Licence du contenu d'un skill individuel**, qui peut différer de celle du dépôt : les 4
   skills documentaires d'Anthropic (`docx`, `pdf`, `pptx`, `xlsx`) portent un `LICENSE.txt`
   propriétaire lu verbatim interdisant extraction, copie, dérivés et redistribution — y compris
   quand ils sont hébergés dans un dépôt tiers qui affiche une licence permissive en façade,
   comme démontré chez ComposioHQ (`diff` identique, `exit 0`).
3. **Licence du texte de description** (le champ que whichskill veut indexer). Aucune des
   sources consultées ne déclare explicitement de licence sur les champs `description` pris
   isolément — ils héritent implicitement de la licence du fichier `SKILL.md` qui les contient.
   Pour un corpus publié sous CC BY-SA, la position prudente est : **indexer les faits (nom,
   catégorie, URL source, type) librement — les faits ne sont pas protégeables — mais ne pas
   recopier verbatim une `description` d'auteur sans licence explicitement compatible**, et
   **exclure catégoriquement** les 4 skills documentaires propriétaires d'Anthropic de tout
   miroir de contenu (nom et URL source seuls, pas de texte).

## Limites / à vérifier

- **Le débit à 286 fetches n'a pas été testé.** L'étape 3 suppose que cloner/télécharger 286
  sources de plugins (dont 150 dépôts `url` externes) est faisable en pipeline ; aucun test de
  charge ni de rate-limit GitHub anonyme n'a été fait.
- **L'écart 864 vérifié vs « 1000+ » revendiqué chez ComposioHQ n'est pas expliqué** — README non
  mis à jour, ou chiffre arrondi dès le départ. Non tranché.
- **claudeskills.info et skills.sh sont eux-mêmes des agrégateurs non vérifiés en amont** :
  aucune garantie que leurs pipelines de collecte respectent les licences des dépôts indexés.
  whichskill ingérant *depuis* eux hériterait de leurs angles morts, pas seulement de ceux des
  dépôts d'origine.
- **Le nombre exact de skills.sh reste une borne basse.** 20 000 est un plafond de pagination de
  sitemap (2 × 10 000), pas un total confirmé — le vrai chiffre peut être supérieur.
- **`anthropics/claude-plugins-official` référence un dépôt `claude-plugins-public`** dans le
  champ `homepage` d'une entrée (`agent-sdk-dev`) sans que ce dépôt ait été identifié
  séparément — possible renommage historique non nettoyé, non creusé.
- **Aucune vérification faite sur les autres sources `awesome-*`** de la recherche précédente
  (karanb192, travisvn, NVIDIA/skills, etc.) — hors périmètre, qui portait sur les neuf sources
  demandées plus `agentskills.io`/`marketplace.json`.
- **Les stars de claudeskills.info sont en léger retard** (~10 % sous la valeur live pour
  obra/superpowers) — fraîcheur du cache connue seulement via leur doc (« cached 5 min »), pas
  mesurée indépendamment sur plusieurs items.

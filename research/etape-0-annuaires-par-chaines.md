# Étape 0 — Existe-t-il déjà un annuaire de skills organisé par chaînes ?

Recherche du 2026-08-14, en réponse à l'étape 0 bloquante du design doc skillflow.
Budget : tier standard, 18 sources lues par cinq lecteurs indépendants, plus trois vérifications faites en direct sur les citations qui portent la conclusion.

## Verdict

**Go, mais la thèse doit être resserrée avant d'être écrite sur le site.**

La formulation initiale — « aucun annuaire n'organise son contenu en chaînes » — **est fausse**. Trois projets publient des séquences ordonnées de skills. Ce qui reste vide, et qui est vérifié sur l'ensemble des sources, c'est autre chose et c'est plus étroit :

1. **Personne n'indexe par situation.** Tous indexent par catégorie, domaine, rôle, popularité ou intégration.
2. **Personne n'arbitre entre skills concurrents.** Une seule exception partielle, trouvée sur ~20 sources.
3. **Personne ne publie de chaîne cross-pack.** Chaque pack qui publie un ordre ne cite que ses propres skills.

Positionnement recommandé : non pas « le premier annuaire de chaînes », mais **« le premier annuaire cross-pack indexé par situation, avec arbitrage entre skills concurrents »**. Plus étroit, vérifié, et toujours inoccupé.

## Ce qui existe : les catalogues plats

Le format dominant, sans exception dans l'échantillon.

| Site | Unité listée | Navigation | Arbitrage |
|---|---|---|---|
| [Agensi](https://agensi.io) | skill isolé, `SKILL.md` | 8 catégories | non (mais voir plus bas) |
| [ClaudeSkills.info](https://claudeskills.info) | skill isolé | 50+ catégories, 6 collections par éditeur | non |
| [skills.sh](https://skills.sh) | skill isolé, install npm | popularité, thème, agent, type « Packs » | non |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | skill isolé, 1000+ | catégories thématiques | non |
| [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | **plugin** (peut contenir plusieurs skills) | catégorie, recherche | non |

Les « collections » de ClaudeSkills.info sont des regroupements **par éditeur** (Anthropic, Microsoft, GitHub, PostHog, Trail of Bits), pas des séquences. Les « Packs » de skills.sh sont le seul terme de regroupement repéré sur les sites grand public, sans logique de séquence documentée.

## Ce qui existe aussi, et que la thèse initiale ratait : trois chaînes publiées

**[obra/superpowers](https://github.com/obra/superpowers)** publie « The Basic Workflow », une séquence explicite en sept étapes : brainstorming → using-git-worktrees → writing-plans → (subagent-driven-development ou executing-plans) → test-driven-development → requesting-code-review → finishing-a-development-branch.

Vérifié en direct : c'est **une seule happy path canonique**, pas un annuaire de situations. Le README ne référence **aucun** skill d'un autre pack (ni gstack, ni la suite Matt Pocock). Et sur le seul recouvrement interne visible, `executing-plans` contre `subagent-driven-development`, les deux sont reliés par un simple « or », sans critère de choix. La chaîne est publiée, l'arbitrage ne l'est pas.

**[garrytan/gstack](https://github.com/garrytan/gstack)** publie un ordre canonique de sprint (Think → Plan → Build → Review → Test → Ship → Reflect) **et une matrice partielle d'arbitrage** : « Which review should I use ? », avec `/plan-design-review` puis `/design-review` pour l'UI, `/plan-devex-review` puis `/devex-review` pour une API ou une CLI, `/plan-eng-review` puis `/review` pour l'architecture.

**C'est la seule occurrence d'arbitrage publié trouvée sur l'ensemble de la recherche.** Elle est partielle : elle couvre les revues, pas les ~23 skills du pack, et elle ne sort pas du pack.

**[borghei/Claude-Skills](https://github.com/borghei/Claude-Skills)** (478 étoiles, 153 commits) est le voisin le plus proche, et c'est celui que j'ai vérifié moi-même plutôt que de faire confiance au résumé.

Ce qu'il annonce : « 4 multi-agent patterns for complex workflows: sequential pipeline, parallel fan-out, supervisor delegation, and consensus voting », plus « 5 chain pipelines », plus des kits pré-configurés par rôle (`SaaS Founder Kit`, `DevOps Kit`, `Compliance Kit`).

Ce que la vérification donne : **les quatre « patterns » sont des schémas d'orchestration à l'exécution, pas des chaînes de skills nommés.** Un « sequential pipeline » décrit comment des agents se coordonnent, pas « pour ce problème, lance d'abord X puis Y ». L'index est par domaine (Project Management 68, Engineering 91, Marketing 39, C-Level 31) et les kits sont **par rôle**, pas par situation. Aucun arbitrage entre skills qui se recouvrent.

## Ce qui n'existe nulle part

**L'indexation par situation.** Sur les ~20 sources, la navigation est toujours par catégorie technique, domaine métier, rôle, éditeur, popularité ou intégration. Jamais par le problème que la personne a devant elle. Le plus proche sont les « ready-made kits by role » de borghei, qui restent un regroupement par métier.

**L'arbitrage entre concurrents.** Une seule occurrence, partielle et intra-pack (gstack). Une recherche ciblée sur des formulations du type « prefer skill X over Y » n'a remonté que des skills de résolution de conflits Git, sans rapport.

**La chaîne cross-pack.** Aucune source ne cite les skills d'un autre pack. C'est structurellement logique : chaque pack documente le sien. Et c'est exactement le trou, puisque la douleur décrite dans le design doc naît du recouvrement **entre** packs installés côte à côte.

## La distinction que le site devra poser explicitement

[agentskills.io](https://agentskills.io), qui héberge la spécification du format, vend le skill comme : « Repeatable workflows: Turn multi-step tasks into consistent, auditable procedures ».

La séquence est donc **dans** un skill, jamais **entre** des skills. C'est la confusion que quelqu'un opposera au projet en disant « les workflows existent déjà ». La note à retenir pour la rédaction : un skill encapsule un workflow interne ; skillflow ordonne des skills entre eux. Ce n'est pas le même objet.

Anthropic reconnaît d'ailleurs la composition dans les « Key benefits » de sa page officielle : « Compose capabilities: Combine Skills for complex, multistep tasks » ([Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)). Mais aucun détail opérationnel n'est donné sur l'ordre, et **aucun mécanisme officiel ne permet à un skill d'en appeler un autre**. Le déclenchement reste un appariement automatique entre la requête et le champ `description`. La chaîne n'est donc ni déclarable ni publiable dans le format officiel — ce qui est une raison de plus pour qu'elle vive dans un annuaire externe.

## Le signal le plus encourageant

Agensi ne propose aucun bundle dans son catalogue, mais publie des articles éditoriaux : « Best Skill Combinations: Bundles That Work Together », « Claude Code Starter Kit: 5 Essential Skills », et même un comparatif « Claude Code vs Cursor vs Copilot in 2026 » ([agensi.io](https://agensi.io)).

Le besoin d'ordre et de combinaison est donc assez réel pour qu'un acteur du marché écrive des articles dessus, sans jamais l'avoir promu au rang de structure de son catalogue. C'est la définition d'un besoin constaté et non servi.

## Hors du monde des skills : le format marche-t-il ailleurs ?

Réponse courte : la partie « séquence » oui, la partie « arbitrage » non.

- [n8n workflows](https://n8n.io/workflows/) héberge 11 490 templates. Navigation par catégorie thématique et par intégration (« What's in your stack? »), pas par situation. **Aucune recommandation dirigée**, aucune comparaison d'outils : le site invite à explorer soi-même.
- [AI UX Playground](https://aiuxplayground.com/guides/playbooks-chain-ai-prompts-into-workflows/) publie 18 « playbooks » qui enchaînent des prompts en séquences réutilisables, classés par domaine professionnel. Chaque étape lie « des prompts pertinents » **sans justification différenciée**.

Autrement dit : le format « annuaire de séquences » est éprouvé et fonctionne à grande échelle. Le format « annuaire de séquences **avec arbitrage argumenté** » n'a été trouvé nulle part, dans aucun domaine. C'est à double tranchant, et il faut le dire : soit personne n'y a pensé, soit l'arbitrage est coûteux à produire et à maintenir pour une valeur que le marché n'a pas encore validée. Le design doc chiffre déjà ce coût à ~15 min ou ~1h30 par chaîne selon les cas.

## Le risque concurrentiel à surveiller

`borghei/Claude-Skills` : 478 étoiles, catalogue large, déjà organisé en kits par rôle, déjà porteur d'un vocabulaire de pipelines. C'est le seul projet à un pivot de distance du terrain visé. S'il passe de « kit par rôle » à « parcours par situation », il occupe la place avec une avance de catalogue considérable.

Ça ne change pas la décision de continuer. Ça change la priorité : ce qui protège n'est pas le catalogue, c'est l'arbitrage, parce que c'est la seule partie que ni un scraper ni un fork ne récupèrent.

## Limites et à vérifier

- Les « 5 chain pipelines » de borghei/Claude-Skills n'ont pas été lus en détail. Deux fetch sur le README suffisent à établir que les 4 patterns sont de l'orchestration runtime, mais **le contenu exact des 5 pipelines reste non vérifié**. C'est la seule chose qui pourrait encore invalider le point 1.
- Six dépôts `awesome-*` non ouverts faute de budget : karanb192, travisvn, NVIDIA/skills, alirezarezvani, VoltAgent/awesome-agent-skills, BehiSecc. Leurs descriptions suggèrent des catalogues plats, non vérifié.
- Le type « Packs » de skills.sh n'a pas été exploré en profondeur. **Si les Packs s'avéraient ordonnés, le point 1 du verdict serait à revoir.**
- `wshobson/agents` mentionne « 16 orchestrators » ; `docs/agents.md` et `ARCHITECTURE.md` n'ont pas été lus.
- Zapier, Dify et les annuaires de serveurs MCP n'ont pas été vérifiés en source primaire, seulement via des extraits de recherche.
- Le format exact du manifeste de bundle de `claude-plugins-official` (champ `skills`) vient d'un résumé, pas d'un fichier JSON lu verbatim. On ne peut donc pas confirmer s'il existe un mécanisme technique permettant à un skill d'en invoquer un autre.

## Deux affirmations écartées après vérification directe

Les lecteurs travaillaient parfois sur des extraits de résultats de recherche plutôt que sur les pages. Deux prétentions de routeur concurrent ont été contrôlées en direct :

- **`GetBindu/awesome-claude-code-and-skills`** était annoncé comme un routeur avec Ollama et BM25. Vérification : c'est un **agrégateur plat**, organisé par catégorie, sans logique de routage ni arbitrage. « No browsable routing interface is documented in this repository. » Écarté.
- **`zhaoxuya520/reverse-skill`** n'a pas pu être vérifié et n'est donc **pas** compté comme concurrent. À contrôler si le sujet revient.

C'est la raison pour laquelle la conclusion de ce document repose sur des pages lues, pas sur des extraits de recherche.

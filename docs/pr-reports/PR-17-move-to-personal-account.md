# PR #17 — Pointer toutes les URL d'installation vers le nouveau propriétaire

## Contexte

Le dépôt vivait dans l'organisation GitHub `whichskill`, dont il était le seul membre.
L'auteur a décidé de le sortir de là et de le garder dans ses dépôts personnels, puis de
supprimer l'organisation.

L'état constaté avant de toucher à quoi que ce soit, parce qu'il décide du coût de
l'opération : **zéro étoile, zéro fork, zéro watcher, un seul membre.** Personne
d'extérieur ne dépend encore de l'URL. C'est le moment le moins cher pour déménager, et
ce constat est ce qui a fait choisir « maintenant » plutôt que « plus tard ».

## Ce qui rend cette PR nécessaire, et pas seulement propre

Un transfert de dépôt GitHub laisse une **redirection** de l'ancienne adresse vers la
nouvelle. Tant que l'organisation existe, `github.com/whichskill/whichskill` continue
donc de résoudre, et rien ne casse.

**Supprimer l'organisation emporte la redirection.** Or le README documente
l'installation par cette adresse :

```
git clone https://github.com/whichskill/whichskill ~/.claude/skills/which-skill
npx skills add whichskill/whichskill
```

Sans cette PR, les deux commandes du README auraient renvoyé un 404 le jour de la
suppression — et avec elles chaque lien de PR de `docs/pr-reports/`, qui est le seul
endroit où l'historique des décisions de ce dépôt est écrit.

## Ce qui a changé

Un seul remplacement mécanique, `whichskill/whichskill` → `OmarBenje/whichskill`.
**Le nom du dépôt ne change pas**, seulement le segment propriétaire : c'était le point
du choix de nom, pour n'avoir qu'une chose à propager.

| Fichier | Occurrences | Ce que ça répare |
|---|---|---|
| `README.md` | 2 | les deux commandes d'installation |
| `site/index.html` | 4 | lien de marque, bloc `git clone`, ligne `npx skills add`, lien de pied |
| `.github/workflows/ci.yml` | 1 | un commentaire citant la commande, gardé copiable-collable |
| `docs/pr-reports/*.md` | 10 | les liens vers les PR #2 à #15 |
| `docs/research/setup-and-update-patterns.md` | 4 | les exemples d'installation étudiés |

**Les liens de PR restent valides** parce que les issues et les pull requests voyagent
avec le dépôt lors d'un transfert : `.../OmarBenje/whichskill/pull/11` résout bien vers
la PR #11 d'origine.

`whichskill.pages.dev` est laissé intact : c'est le domaine Cloudflare Pages, sans
rapport avec le propriétaire GitHub.

## Vérification

| Contrôle | Résultat |
|---|---|
| Occurrences restantes de `whichskill/whichskill` | 0 |
| Occurrences restantes de `github.com/whichskill` | 0 |
| Occurrences de `github.com/whichskill` sans `/whichskill` derrière | 0, vérifié **avant** le remplacement |
| Diff | 21 remplacements, 12 fichiers, 21 insertions / 21 suppressions |
| CI (`verify`) | **verte**, 8 s |
| README sur `main` après merge | les deux commandes portent la nouvelle adresse |

Le contrôle « sans `/whichskill` derrière » a été fait en premier et pour une raison
précise : un `sed` sur `github.com/whichskill` aurait aussi frappé une éventuelle URL
d'organisation nue et produit `github.com/OmarBenje` là où il fallait autre chose. Il n'y
en avait aucune, mais le remplacement a été écrit sur le motif long de toute façon.

La CI verte prouve aussi autre chose que le contenu : les workflows GitHub Actions ont
suivi le transfert et s'exécutent bien sous le nouveau propriétaire.

## PR

https://github.com/OmarBenje/whichskill/pull/17 — **mergée** (squash, `c054afb`), branche
supprimée.

## Points de suivi

1. **L'organisation `whichskill` est vide mais existe encore.** Sa suppression demande le
   scope `admin:org`, absent du jeton local, donc elle passe par l'interface web :
   *Settings → General → Delete this organization*. Tant qu'elle vit, l'ancienne adresse
   redirige ; le jour de la suppression, seul ce qui a été corrigé ici tient.
2. **Le nom `whichskill` redevient disponible pour n'importe qui** une fois l'organisation
   supprimée. Si le nom compte, le garder coûte zéro sur un compte gratuit.
3. **Cloudflare Pages est à rebrancher à la main.** L'intégration GitHub d'un projet Pages
   est liée au couple propriétaire/dépôt ; le transfert la coupe. À vérifier dans le
   tableau de bord Cloudflare, sinon `whichskill.pages.dev` cesse de se reconstruire à
   chaque poussée — sans que rien ne le signale.
4. **Les deux checkouts locaux ont été repointés** — `~/.claude/skills/which-skill` et
   `~/orca/projects/skillflow`. Toute autre copie sur une autre machine continuera de
   marcher par la redirection, puis cassera à la suppression de l'organisation. Un
   `git remote set-url origin https://github.com/OmarBenje/whichskill.git` la répare.

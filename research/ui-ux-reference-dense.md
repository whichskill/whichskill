# UI/UX d'un site éditorial de référence dense — recherche

Recherche du 2026-08-15, cinq lecteurs indépendants (un par facette), plus deux vérifications
tentées en direct sur `aria-sort` et sur la divulgation de méthode des sites de jugement
(Tech Radar), non abouties — voir « Limites / à vérifier ».

Décisions déjà verrouillées, non remises en cause ici : dark mode unique, pleine largeur,
sidebar fixe ~210px à trois sections, Inter (grotesque) + mono, zéro couleur d'accent,
zéro carte, `border-radius: 0`, haute densité.

## Règles actionnables (à lire en premier)

1. Le corpus (~43 pages, 3 sections) est dans la zone où les sites de référence recommandent
   une sidebar persistante. Quarto : « if your site consists of more than a handful of
   documents, you might prefer to use side navigation » et, à plus grande échelle,
   « if you have a website with dozens or even hundreds of pages, you will likely want to use
   top and side navigation together ». Aucun seuil numérique exact trouvé dans une source
   primaire. — [quarto.org](https://quarto.org/docs/websites/website-navigation.html)
2. Repli mobile sans JS via `<details>`/`<summary>` : pour fermer, il faut retirer l'attribut
   `open`, pas le mettre à `open="false"` (qui reste ouvert). Aucune transition d'ouverture
   native n'existe. — [MDN `<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)
3. Safari exige `::-webkit-details-marker` en plus de `::marker` standard pour restyler le
   triangle de `<summary>`. — [MDN `<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary)
4. GOV.UK signale deux risques UX réels sur `<details>` : les utilisateurs évitent parfois de
   cliquer par peur de « quitter la page », et certains lecteurs vocaux ne peuvent pas
   l'activer. — [design-system.service.gov.uk/components/details](https://design-system.service.gov.uk/components/details/)
5. Table de 102 lignes × 5 colonnes : aucune source primaire ne donne un seuil chiffré de
   pagination/virtualisation. TanStack Table ne dit que « very large number of rows » déclenche
   la virtualisation et que les petites tables doivent rester en rendu normal — 102 lignes n'est
   nulle part décrit comme relevant de ce territoire. L'exemple officiel W3C APG de table
   triable est un `<table>` complet, non paginé. — [tanstack.com](https://tanstack.com/table/latest/docs/framework/lit/guide/virtualization), [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
6. Colonne triable : `aria-sort="ascending"` ou `"descending"` sur le seul `<th>` actuellement
   trié, retiré des autres ; le déclencheur est un vrai `<button>` dans l'en-tête, ce qui donne
   Entrée/Espace et Tab gratuitement, sans gestion clavier custom. — [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
7. Plancher de contraste texte (thème sombre unique imposé) : WCAG 1.4.3 (AA) = 4,5:1 texte
   normal / 3:1 grand texte (≥18pt, ou ≥14pt gras) ; WCAG 1.4.6 (AAA) = 7:1 / 4,5:1.
   — [w3.org, SC 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), [SC 1.4.6](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
8. Ne pas utiliser #000000/#FFFFFF purs. Le codelab officiel Material recommande un fond
   #121212 (pas noir pur) et un texte blanc plafonné en opacité : 87 % haute emphase, 60 %
   moyenne, 38 % désactivé — le blanc pur « vibre » et « bave » (halation) sur fond noir pur.
   — [codelabs.developers.google.com](https://codelabs.developers.google.com/codelabs/design-material-darktheme)
9. Le calcul WCAG 2.x est documenté (par le projet APCA, pas par le W3C) comme aveugle à la
   polarité et sujet à surestimer le contraste des paires sombres : un texte proche du noir peut
   passer 4,5:1 sur le papier et rester illisible en pratique. — [apcacontrast.com](https://apcacontrast.com/)
10. Aucun des deux sites de référence étudiés pour le verdict sans couleur (caniuse.com,
    roadmap.sh) ne se passe réellement de couleur : les deux couplent couleur + glyphe/texte
    redondant. WCAG 1.4.1 interdit seulement que la couleur soit l'**unique** canal, pas la
    couleur elle-même. — [w3.org, SC 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html), [caniuse.com](https://caniuse.com/)
11. Attribution : PyPI sépare « Author » / « Maintainer » (liens mailto) d'un lien « Source »
    distinct dans un bloc dédié, tous deux cliquables. — [pypi.org/project/requests](https://pypi.org/project/requests/)
    Aucun registre, aucune awesome-list, aucun site de jugement consulté (ThoughtWorks Tech
    Radar) ne documente de processus de droit de réponse formel.

## 1. Navigation pour un corpus de référence de taille moyenne

**Convergence sidebar vs barre horizontale.** Quarto (générateur de sites doc officiel) est la
seule source primaire trouvée qui formule une règle, et elle reste qualitative : au-delà de
« a handful of documents », préférer la navigation latérale, qui « enables you to display an
arbitrarily deep hierarchy of articles » ; à l'échelle de « dozens or even hundreds of pages »,
combiner barre du haut (sections) et sidebar (contenu de la section).
[quarto.org/docs/websites/website-navigation.html](https://quarto.org/docs/websites/website-navigation.html)

Docusaurus ne donne aucun critère stratégique sidebar-vs-navbar dans sa doc officielle ; le
seul point chiffré concerne l'appareil, pas le nombre de pages : la sidebar repliable est
« especially useful when content is consumed on medium-sized screens (e.g. tablets) ».
[docusaurus.io/docs/sidebar](https://docusaurus.io/docs/sidebar)

Diátaxis, source qui aurait pu trancher, ne donne **aucune** recommandation de navigation ou
de seuil de pages — le framework se présente explicitement comme « light-weight » et laisse
l'IA aux projets. Absence confirmée, pas silence par manque de recherche.
[diataxis.fr](https://diataxis.fr/)

**Aucune source primaire (Quarto, Docusaurus, GOV.UK, MDN, GitLab, Gitbook, Mintlify) ne donne
de seuil numérique de pages** à partir duquel une sidebar « gagne » clairement sur une barre
horizontale. Les chiffres rencontrés (« 5–10 items favorise la sidebar », « >10 items la
sidebar passe mieux à l'échelle ») viennent d'un article Medium, donc **secondaire et non
vérifié**. Ce vide confirme au moins que le choix d'une sidebar fixe pour ~43 pages sur 3
sections n'est contredit par aucune source lue — c'est cohérent avec Quarto, sans être prouvé
par un chiffre.

**Repli mobile sans JavaScript.** MDN (source primaire, s'appuyant sur le HTML Living Standard
sans que celui-ci ait été relu directement) documente pour `<details>`/`<summary>` :
- Pas d'animation native de la transition ouvert/fermé.
- Piège d'attribut booléen : `open="false"` reste **ouvert** ; il faut retirer l'attribut.
- `<summary>` a un rôle ARIA implicite incohérent selon les navigateurs ; un titre placé dans
  `<summary>` peut perdre sa sémantique de heading pour les lecteurs d'écran.
- Support de base large depuis janvier 2020, « some parts may have varying levels of support ».
[developer.mozilla.org/.../details](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details), [.../summary](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary)

GOV.UK, qui utilise `<details>` en production, documente deux risques UX indépendants des bugs
navigateur : la peur de « quitter la page » qui dissuade certains utilisateurs de cliquer, et
l'inaccessibilité au clic pour certains logiciels d'assistance vocale.
[design-system.service.gov.uk/components/details](https://design-system.service.gov.uk/components/details/)

Coût pour la décision verrouillée (sidebar fixe 210px desktop) : le repli mobile sans JS devra
accepter un « snap » instantané sans transition, et prévoir un état visuel de secours pour les
utilisateurs qui n'osent pas cliquer sur le triangle — ce n'est pas un bug à corriger, c'est la
limite native de l'élément.

## 2. Tables denses

**Pagination vs rendu complet vs virtualisation.** TanStack Table (doc officielle) ne fixe
aucun seuil chiffré : virtualisation recommandée pour un « very large number of rows », rendu
normal « simpler and usually preferable » pour les petites tables.
[tanstack.com/table/.../virtualization](https://tanstack.com/table/latest/docs/framework/lit/guide/virtualization)
L'exemple officiel W3C APG de table triable est un `<table>` HTML classique intégralement
rendu, sans pagination ni virtualisation.
[w3.org/WAI/ARIA/apg/.../sortable-table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
GOV.UK ne donne qu'une consigne qualitative : « If you have a lot of data, try to organise it
into multiple tables or multiple pages », sans seuil.
[design-system.service.gov.uk/components/table](https://design-system.service.gov.uk/components/table/)

Aucune source primaire consultée ne fixe de seuil numérique de lignes. Un chiffre de « ~50
lignes » pour TanStack a été vu en extrait de recherche mais **non confirmé sur une page
TanStack réellement lue** — traité comme non vérifié. Conclusion prudente : 102 lignes reste,
dans toutes les sources lues, du côté « rendu complet », mais ce n'est pas prouvé par un chiffre
officiel — seulement par l'absence de tout signal contraire.

**Hauteur de ligne et densité.** Échec de vérification chiffrée : la page GOV.UK ne donne pas
de pixels (seulement une classe modificatrice `govuk-table--small-text-until-tablet`) ; la page
composant USWDS ne donne pas de pixels non plus (les valeurs vivent dans des design tokens non
consultés) ; la page Material Design 2 data-tables n'a renvoyé qu'un titre vide au fetch. **Aucun
chiffre de hauteur de ligne en px n'a pu être vérifié en source primaire dans ce budget** — à
traiter comme un vrai manque, pas une généralité comblée à la main.
[design-system.service.gov.uk/components/table](https://design-system.service.gov.uk/components/table/), [designsystem.digital.gov/components/table](https://designsystem.digital.gov/components/table/)

**ARIA colonne triable.** `aria-sort` prend `"ascending"` ou `"descending"`, posé sur le seul
`<th>` trié à l'instant t, retiré de la colonne précédente. Le déclencheur de tri est un
`<button>` natif dans l'en-tête (pas un gestionnaire de clic sur `<th>` brut) : « the only
interactive elements are HTML button elements, and all their keyboard functionality is
provided by browsers » — Entrée/Espace/Tab viennent gratuitement, sans JS clavier custom.
[w3.org/WAI/ARIA/apg/.../sortable-table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
Une tentative de relire directement la définition `aria-sort` dans la spec WAI-ARIA 1.2 pour
vérifier les valeurs `"none"` et `"other"` (connues par ailleurs) n'a pas abouti — la portion
récupérée du document s'arrêtait avant la section 6.7 qui les définit. Ces deux valeurs ne sont
donc **pas** vérifiées ici en source primaire ; seules `"ascending"`/`"descending"` le sont, via
l'exemple APG.

## 3. Typographie et contraste en dark-mode-only

**WCAG 2.x, chiffres exacts (source primaire W3C).** SC 1.4.3 (AA) : texte normal 4,5:1, grand
texte (≥18pt, ou ≥14pt gras) 3:1. SC 1.4.6 (AAA) : texte normal 7:1, grand texte 4,5:1.
[w3.org, SC 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), [SC 1.4.6](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)

**Contradiction explicite APCA vs WCAG 2.x.** Le projet APCA affirme que la formule WCAG 2
« far overstates contrast for dark colors to the point that 4.5:1 can be functionally
unreadable when a color is near black ». Table d'équivalence approximative donnée : Lc 90 ≈
WCAG 7:1, Lc 75 ≈ WCAG 4,5:1, Lc 60 ≈ WCAG 3:1 — mais les valeurs Lc d'APCA sont signées
(négatif = texte clair sur fond sombre, positif = l'inverse) et perceptuellement uniformes, ce
qu'un ratio WCAG 2 unique ne peut pas représenter selon la polarité. C'est une divergence
affirmée par la source APCA elle-même, pas par le W3C — donc à citer comme un désaccord non
arbitré entre deux sources, pas comme un fait établi des deux côtés.
[apcacontrast.com](https://apcacontrast.com/), [github.com/Myndex/SAPC-APCA](https://github.com/Myndex/SAPC-APCA)
WCAG 3 (brouillon) n'a pas pu être relu directement dans ce passage — l'écart avec WCAG 2 vient
uniquement de la documentation du projet APCA, à traiter comme partiellement vérifié.

**Pièges concrets, avec valeurs de remplacement (source primaire Google Material).** Le codelab
officiel Material recommande un fond #121212 plutôt que #000000 pur, et un texte blanc plafonné
en opacité : 87 % haute emphase, 60 % moyenne emphase, 38 % désactivé. Citation verbatim : le
blanc pur « would visually vibrate against our dark backgrounds » et « can harm legibility
since the light from that text appears to bleed or blur against the dark background » — c'est
la halation nommée explicitement, sans utiliser ce mot.
[codelabs.developers.google.com](https://codelabs.developers.google.com/codelabs/design-material-darktheme)
Material 3 (m3.material.io) et Apple HIG dark mode n'ont pas pu être relus (404 et coquille JS
respectivement) — cette recommandation ne s'appuie donc que sur l'ancien codelab Material 2,
pas sur la version actuelle du design system ni sur une source Apple.

**Grotesque vs serif sur fond sombre.** Aucune source primaire (fonderie, recherche W3C/WAI,
papier académique) trouvée dans le budget imparti. Absence confirmée par la recherche, pas
supposée — ce facet reste sans preuve dans un sens ou dans l'autre pour Inter.

Coût pour la décision verrouillée (dark mode unique, gris uniquement) : la palette devra viser
un fond proche de #121212 plutôt que #000000, et un blanc/gris clair plafonné en opacité plutôt
qu'un blanc pur à 100 %, pour éviter la halation documentée par Material — cela reste compatible
avec « greyscale only », ce n'est pas une couleur, juste une luminance à ne pas pousser au
maximum. Et parce que WCAG 2.x est documenté comme peu fiable sur les paires sombres, le
plancher 4,5:1 doit être vérifié en Lc (APCA) en plus du ratio WCAG, pas à sa place, pour ne
pas se fier à un chiffre qui passe sur le papier et reste illisible à l'écran.

## 4. Verdict sans couleur d'accent

WCAG 1.4.1 (source primaire) interdit que la couleur soit « the only visual means of conveying
information » — exemples donnés : champ obligatoire marqué seulement en rouge, erreur marquée
seulement en rouge, catégories distinguées seulement par rouge/bleu, toutes en échec sauf si
doublées de texte, icône ou motif.
[w3.org, SC 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)

**caniuse.com, markup réel relu (pas résumé).** Chaque état de légende couple une classe
couleur (`y`/`n`/`a`/`u`) à un glyphe Unicode distinct dans un span séparé
`ciu-legend__symbol` : `✅` supporté, `❌` non supporté, `◐` partiel, `﹖` inconnu. La forme
double le canal couleur exactement comme l'exige 1.4.1 — mais **la couleur reste présente**,
elle n'est jamais retirée. [caniuse.com](https://caniuse.com/)

**roadmap.sh, données embarquées relues directement.** Le JSON embarqué du graphe SVG contient
une valeur littérale `"dashed"` comme style de trait — pointillé vs plein distingue donc un type
de chemin indépendamment de la couleur — et la chaîne littérale `"Personal Recommendation"`,
confirmant qu'une étiquette texte explicite marque certains nœuds plutôt qu'un badge coloré
seul. Les valeurs exactes de poids/taille de police n'ont pas pu être extraites : le rendu est
client (React/Next.js), le fetch statique n'expose que les props JSON, pas le CSS calculé.
[roadmap.sh/frontend](https://roadmap.sh/frontend)

Un site de comparaison « X vs Y » (type versus.com) n'a pas été relu, faute de budget — à
traiter comme non couvert plutôt que comme absence de dispositif.

**Constat qui touche directement la décision verrouillée.** Aucun des deux sites de référence
étudiés ne se passe réellement de couleur : les deux couplent couleur + glyphe/texte/motif
redondant, ce que 1.4.1 exige, mais aucun ne va jusqu'à zéro couleur. La contrainte « zéro
couleur d'accent » de whichskill est donc plus stricte qu'aucun des précédents étudiés. Coût :
le poids entier de « le gagnant est visible du premier coup d'œil » doit être porté par la
typographie seule — graisse, taille, densité, barré, ordre, libellé texte — sans le filet de
sécurité que même caniuse.com et roadmap.sh gardent. C'est cohérent avec la règle « le bloc
interdit est plus dense, jamais plus fort » déjà posée dans DESIGN.md, mais aucune preuve
externe ne garantit que la lisibilité tiendra sans un seul pixel de couleur — c'est un pari,
pas une pratique validée ailleurs.

## 5. Attribution d'auteur dans les catalogues open source

**Registres, PyPI vérifié en direct.** La page `requests` affiche une section « Credits » avec
un champ « Author: » et un champ « Maintainer: » séparés, chacun en lien mailto cliquable, une
boîte « 3 maintainers » avec avatars liés aux profils PyPI, et une boîte « Project links »
listant « Source » et « Documentation », les deux cliquables.
[pypi.org/project/requests](https://pypi.org/project/requests/)
npm et crates.io n'ont pas pu être relus en rendu (403 sur npmjs.com, coquille JS sur
crates.io) ; seules les API brutes (`registry.npmjs.org`, `crates.io/api/v1`) confirment que
`author`, `maintainers` et `repository` existent comme champs structurés distincts — le rendu
UI exact (libellé, emplacement) sur ces deux sites n'est **pas vérifié**, seulement inféré des
données. Motif commun aux trois registres, dans la mesure où il est vérifiable : identité de
l'auteur et lien vers le dépôt source sont deux champs distincts, tous deux liés.

**Awesome-lists.** Les guidelines officielles de `sindresorhus/awesome` (`awesome.md`)
exigent une recommandation personnelle et une explication du bénéfice, un format cohérent, mais
**n'imposent aucune mention explicite d'auteur par entrée** — l'attribution passe par le lien
du titre du projet, pas par une ligne « by X » séparée.
[github.com/sindresorhus/awesome/blob/main/awesome.md](https://github.com/sindresorhus/awesome/blob/main/awesome.md)

**Sites de jugement comparatif.** State of JS 2025 (page « Metadata ») ne documente que la
démographie du sondage et un lien générique « Report an issue » vers GitHub — **aucune page de
méthodologie ni de processus de contestation** trouvée.
[2025.stateofjs.com/en-US/metadata](https://2025.stateofjs.com/en-US/metadata/)
La FAQ du ThoughtWorks Technology Radar décrit sa méthode (« members of the TAB spend several
hours debating the nominated blips ») mais énonce explicitement : « We don't have a formal
process for external people to nominate tech, or to arrange demonstrations » — et ne mentionne
aucun mécanisme de réponse ou de contestation pour l'éditeur d'une techno classée.
[thoughtworks.com/en-us/radar/faq](https://www.thoughtworks.com/en-us/radar/faq)

**Constat, énoncé comme un vrai vide et non comme une supposition.** Sur les cinq sources
consultées (trois registres, une awesome-list, un site de jugement comparatif), **aucune ne
documente de droit de réponse formel** pour la partie dont le travail est classé ou jugé. Ce
n'est pas un manque de recherche : Tech Radar, la source la plus proche du cas d'usage
(jugement comparatif publié sur le travail de tiers), énonce l'absence de processus externe en
toutes lettres. Pour whichskill, la règle déjà posée dans CLAUDE.md — chaque perdant reçoit une
ligne « when this wins » — dépasse donc ce qui existe ailleurs dans l'écosystème : c'est plus
qu'aucun précédent étudié n'offre à l'auteur jugé.

## Limites / à vérifier

- Aucune source primaire ne fixe de seuil numérique de pages pour sidebar vs barre horizontale ;
  seul un article Medium secondaire avance des chiffres (5–10 / >10 items), non vérifié.
- WHATWG HTML Living Standard non relu directement pour `<details>`/`<summary>` — appui sur MDN
  seul, qui s'appuie lui-même sur la spec.
- Hauteur de ligne en pixels pour une table dense : **non vérifiée** en source primaire (GOV.UK
  et USWDS renvoient vers des tokens non consultés, Material Design 2 a renvoyé une page vide).
- Seuil de lignes déclenchant la virtualisation (~50 évoqué pour TanStack) : vu seulement en
  extrait de recherche, jamais confirmé sur une page TanStack effectivement lue.
- Valeurs `aria-sort="none"`/`"other"` : tentative de relecture directe de la spec WAI-ARIA 1.2
  infructueuse (contenu récupéré s'arrêtant avant la section 6.7) ; seules `"ascending"` et
  `"descending"` sont vérifiées, via l'exemple W3C APG.
- WCAG 3 / brouillon : la divergence avec WCAG 2.x n'est documentée que du côté du projet APCA,
  jamais relue dans un brouillon WCAG 3 lui-même.
- Material 3 (m3.material.io) et Apple HIG dark mode : pages non accessibles (404 / coquille JS)
  — les recommandations de contraste citées viennent uniquement de l'ancien codelab Material 2.
- Grotesque vs serif sur fond sombre : aucune source primaire trouvée, dans un sens ou l'autre.
- Un site de comparaison « X vs Y » (type versus.com) n'a pas été relu pour la facette 4.
- npmjs.com et crates.io : rendu UI non vérifié (403 / coquille JS) ; seules les données d'API
  brutes confirment l'existence des champs d'attribution.
- Méthodologie de divulgation sur des sites de jugement de type Tech Radar : la tentative de
  relecture en direct de la FAQ ThoughtWorks a confirmé l'absence de processus de contestation,
  mais aucune autre source « judgment site » n'a été consultée pour généraliser ce vide au-delà
  d'un seul exemple.

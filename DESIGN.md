# Design System — whichskill

Created 2026-08-14 by `/design-consultation`. Verified in real rendering, not just described:
all three faces load, all sizes measured in browser. Preview:
`~/.gstack/projects/skillflow/designs/design-system-20260814/preview.html`

## Product Context

- **What this is:** an open-source reference site publishing ordered chains of AI coding-agent skills, indexed by situation, with arbitration between near-duplicate skills.
- **Who it's for:** developers with 100+ skills installed across overlapping packs, who cannot decide which to run.
- **Space:** agent-skill directories. Twelve exist. All are flat searchable catalogs of cards. None indexes by situation, none publishes arbitration.
- **Project type:** dense editorial reference. Not an app, not a marketing site.
- **The one memorable thing:** **it decides for me.** The visitor leaves feeling someone took a position on their behalf. Every decision below serves this.

## Aesthetic Direction

- **Direction:** emergency procedure card. Instrument grey, calm cockpit authority.
- **Decoration level:** minimal. One texture only: the hairline rule.
- **Mood:** it should not look like a website. It should look like a laminated card from the seat pocket — someone already thought this through, all that is left is to execute.
- **Reference sites:** [caniuse.com](https://caniuse.com) (verdict band above dense detail — the information architecture to steal), [roadmap.sh](https://roadmap.sh) (has arbitration data, reduces the verdict to a coloured dot — the mistake to avoid), [docs.astro.build](https://docs.astro.build) (the generic docs look to move away from).

### Three rules that are not decoration

1. **No cards. Anywhere.** A card frames its content as one interchangeable item among many. That is the catalogue framing this product exists to reject, and it is what all twelve competitors look like.
2. **The verdict opens the page.** Never a badge at the bottom. On an arbitration page you read *use this one, not those two* before you learn why.
3. **You do not shout prohibitions, you strike them out.** The "what you do not run" block is *smaller and denser* than the steps, never louder. Red would say "danger", which is false: running the wrong skill is not dangerous, it is simply settled. Density contrast carries the meaning; colour does not.

## Typography

- **Display:** Archivo, weight 700, `font-stretch: 112%` — signage lettering, unused in this market. Situation titles set as sentences with a hard full stop: "A bug that resists." An assertion, not a catalogue entry.
- **Body:** Literata — screen serif, robust, not a trend. The ~208 "why this step" sentences are arguments; arguments are set in a serif.
- **Skill names:** Commit Mono, weight 600. They are commands you type, so they are set as commands. The `/` is muted, the name is full ink: the slash recedes, the verb stays. No chip, no background, no radius.
- **Labels and numbers:** Commit Mono 500, 11px, uppercase, letter-spacing 0.14em.
- **Loading:** Archivo and Literata from Google Fonts (variable). Commit Mono via `@fontsource/commit-mono` (SIL OFL 1.1, free for commercial use). Fallback stack ends in JetBrains Mono.

### Scale

| Role | Size / line-height | Notes |
|---|---|---|
| Situation title | `clamp(48px, 7vw, 76px)` / 0.94 | letter-spacing −0.02em, max 12ch |
| Verdict band | 28px / 1.15 desktop, 22px mobile | −0.01em |
| Skill name (step) | 22px / 1.3 | mono 600 |
| Step reason | 18px / 30px | measure 62ch |
| Forbidden block | 15px / 26px | measure 64ch |
| Arbitration body | 16px / 28px | |
| Index row title | 26px / 1.15 | display face at **600**, not 700 — 700 is optically too heavy at this size |
| Labels | 11px, 0.14em | uppercase mono |

## Color

| Role | Light | Dark |
|---|---|---|
| Background | `#E6E7E2` | `#111310` |
| Plate (surface) | `#F7F7F4` | `#1A1C18` |
| Ink | `#131410` | `#E8EAE2` |
| Muted | `#6E7066` | `#8C8F84` |
| Rule | `#C9CAC2` | `#2B2E28` |
| **Amber** | `#FFB300` | `#FFB300` |

- **Approach:** restrained to the point of austerity. The site has one colour.
- **Amber is identical in both themes.** It is not a theme token, it is printed matter.
- **Allowed, exclusively:** as a solid fill behind `#131410` text on the verdict band. **At most once per page** — a page with no verdict, like the home index, carries no amber at all. It is a ceiling, not a quota.
- **Forbidden:** links, hover, headings, nav, focus rings, inline code, rules, bullets, logo, theme toggle, the forbidden block, every state, every hover.
- **Focus:** 2px ink outline, 2px offset. **Index row hover:** the row inverts, ink fills and text drops out to background colour. Never colour.

## Spacing

- **Base unit:** 4px.
- **Density:** generous vertically (dense reading needs leading), tight horizontally.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64) 4xl(96)

## Layout

- **Approach:** grid-disciplined, asymmetric within the plate.
- **Plate:** 880px. **Reading column:** 680px. The verdict band **overflows** the reading column to the full plate width — that overflow is what makes it read as a stamp rather than a paragraph.
- **Border radius: 0 everywhere.** No exceptions.
- **The ledger:** steps are a register, not a list. 64px left margin holds the step number in muted mono. A **continuous 2px ink rule** runs down through every step and terminates in a short horizontal tick at the last one. It is the only graphic on the site, and it encodes order rather than decorating.
- **Step row:** mono skill name (22px) left, tiny right-aligned mono output label ("PRODUCES A RED TEST"), one serif sentence beneath, hairline rule between steps.
- **Arbitration page:** reads as a diff. Mono gutter, `+` on the winner (which carries the page's single amber band), `−` on each loser, loser name struck through, body indented 32px and dropped to 16/28, plus a mandatory line: *when this loser wins*.
- **Home:** the 33 situations as a **single-column index**, full-width rows, display title 26px, first command right-aligned in mono, hairline between rows. A departures board, not a wall of cards. Chains without arbitration carry a muted `ARBITRATION MISSING` label, which doubles as the contribution invitation.
- **No navigation in the first viewport.** No top bar, no sidebar, no visible search. The global index lives in the footer; search opens on `/`. Accepted cost: discoverability drops and long-tail SEO rests entirely on cross-links between chains. The footer must therefore be irreproachable.

## Motion

- **Approach:** minimal-functional. **One gesture on the entire site.**
- The amber verdict band wipes in from the left, 220ms, ease-out, on page load. Nothing else moves.
- Disabled entirely under `prefers-reduced-motion`.

## Copy rules

- **The word "recommended" appears nowhere on the site.** It hedges, and the product exists to not hedge.
- Verdicts are imperative and second person: "Run X. Not Y."
- Every loser in an arbitration gets a *when this wins* line. Taking a position is not the same as pretending the alternatives are worthless.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-14 | Initial design system | `/design-consultation`, after measuring three reference sites and running an outside design voice |
| 2026-08-14 | Amber verdict band, not a red pen | Red reads as danger, which is false. Amber reads as "someone decided". The forbidden block gets quieter, not louder. |
| 2026-08-14 | Serif body (Literata) | Every dev docs site uses a sans. The step reasons are arguments, and a serif says written rather than generated. |
| 2026-08-14 | No cards anywhere | A card frames content as one interchangeable item among many — the exact catalogue framing the product rejects. |
| 2026-08-14 | Arbitration renders as a diff | Native vernacular for the reader, zero implementation cost. |
| 2026-08-14 | No navigation in the first viewport | A search field reinstalls the buffet anxiety the product exists to kill. Cost accepted: discoverability and long-tail SEO. |
| 2026-08-14 | Fonts self-hosted via `@fontsource`, not a CDN | A CDN link puts a third party in the render path and makes every local build need the network. |
| 2026-08-14 | Focus ring survives the index-row inversion | The first implementation killed the outline on `:focus-visible`, which cost keyboard users their only cue. Hover inverts; focus inverts *and* keeps its ring. |

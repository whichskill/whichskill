# whichskill

An open-source reference site publishing ordered chains of AI coding-agent skills, indexed by
situation, with arbitration between near-duplicate skills. Astro, static, English.

Design doc (source of truth for scope and architecture):
`~/.gstack/projects/skillflow/omarbenjelloun-main-design-20260814-110300.md`

Note: the gstack project slug and this local directory are still `skillflow`. The published
project, the GitHub org and the site are `whichskill`. Renaming the local directory would
orphan the design doc and the decision history.

## Design System

Always read DESIGN.md before making any visual or UI decision.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Three rules from DESIGN.md that are load-bearing and easy to break by accident:

1. **No cards, and `border-radius: 0` everywhere.** A card frames content as one
   interchangeable item among many — the catalogue framing this product rejects.
2. **Amber `#FFB300` appears exactly once per page**, as a solid fill behind ink text on the
   verdict band. It is forbidden on links, hover, headings, nav, focus rings, inline code,
   rules, bullets, and on the "what you do not run" block.
3. **The forbidden block is quieter than the steps, never louder.** Smaller, denser, struck
   through, no colour. Density contrast carries the meaning.

## Copy

The word "recommended" appears nowhere on the site. Verdicts are imperative and second
person. Every loser in an arbitration gets a "when this wins" line.

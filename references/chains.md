# Canonical chains, by kind of work

A starting point, not a rail. Remove the steps already done and the ones the situation does not justify. A three-step chain well chosen beats a twelve-step chain copied out.

## Web / product

**End-to-end UI feature** — nothing exists; it has to be framed, designed, built, shipped.
`/office-hours` → `/design-consultation` → `/spec` → `/autoplan` → `/implement` → `/design-review` → `/ship`

`/autoplan` runs the four plan reviews (CEO, design, eng, DX) on its own with auto-decisions. To keep your hand on them, replace it with `/plan-ceo-review` → `/plan-design-review` → `/plan-eng-review` → `/plan-devex-review`.

`/browse` is what `/design-review` drives, not a step in front of it. Add `/review` before `/ship` when the branch is large, and `/canary` after it when the deploy can hurt.

**Visual polish on an existing screen** — it works, but it looks machine-made.
`/browse` → `/design-review` → `/frontend-design:frontend-design` → `/emil-design-eng` → `/qa` → `/ship`

Motion is its own chain, below. Deciding what should move is a different question from deciding what should look right; merging the two produces a chain nobody finishes.

**Choosing a stack or a library** — the blocking question is "with what".
`/pick-ui-library` → `/prototype` → `/grill-with-docs` → `/to-spec` → `/to-tickets`

**Performance regression** — it was fast, it is not any more.
`/benchmark` → `/investigate` → `/freeze` → `/qa` → `/review` → `/ship` → `/benchmark`

The second `/benchmark` is not a repeat: it is the numeric proof the fix did something.

## Design engineering and motion

**Design system from scratch**
`/design-consultation` → `/design-shotgun` → `/design-html` → `/plan-design-review` → `/ship`

**Adding motion** — the goal is also to reject everything that should not move.
`/animation-vocabulary` → `/find-animation-opportunities` → `/improve-animations` → `/vercel-react-view-transitions` → `/review-animations` → `/browse`

**Visual audit of a live site**
`/setup-browser-cookies` → `/browse` → `/design-review` → `/apple-design` → `/qa-only`

## Backend, APIs, services

**New service or module** — fix the interface before the implementation.
`superpowers:brainstorming` → `/domain-modeling` → `/spec` → `/plan-eng-review` → `/tdd` → `/review` → `/ship`

Add `/codebase-design` when the module's shape is what is contested, `superpowers:using-git-worktrees` to isolate the work, and `/code-review` per ticket once the work splits into several.

**Refactoring a module that aged badly**
`/improve-codebase-architecture` → `/codebase-design` → `/to-spec` → `/to-tickets` → `/implement` ×N → `/review` → `/ship`

`/implement` runs once per ticket, context cleared between each. Add `/grill-with-docs` when a library's real behaviour is the unknown.

**API, SDK or CLI for other developers** — the criterion is time to first successful call.
`/plan-devex-review` → `/tdd` → `/devex-review` → `/wizard` → `/document-generate` → `/ship`

## Full-stack 0→1

**Idea → shipped product.** Three phases, and **you answer with the one the person is in** — never with all three. Fourteen steps in a row is not a chain, it is a roadmap, and nobody acts on a roadmap this afternoon.

Framing — `/office-hours` → `/plan-ceo-review` → `/design-consultation` → `/spec` → `/autoplan`

Building — `/to-tickets` → `/implement` ×N → `/qa` → `/cso` → `/review`

Shipping — `/land-and-deploy` → `/canary` → `/document-release` → `/retro`

`/land-and-deploy` does merge, deploy and verification in one move; `/ship` alone stops at the pull request. Insert `/context-save` before each break.

**Work too large for one session** — this phase's deliverable is decisions.
`/wayfinder` → `/to-spec` → `/to-tickets` → `/implement` → `/handoff`

Wiring the map straight into `/implement` throws the detail away instead of condensing it.

**Deciding on facts**
`/research` → `/graphify` → `/to-questionnaire` → `/grill-with-docs` → `/to-spec`

## iOS and SwiftUI

**Full cycle**
`/ios-sync` → `/ios-qa` → `/ios-fix` → `/ios-design-review` → `/review` → `/ship` → `/ios-clean`

`/ios-clean` removes the DebugBridge and the `#if DEBUG` wiring — not to be forgotten before submission. `/apple-design` replaces `/ios-design-review` when the question is conformance to the Human Interface Guidelines rather than this screen.

**Isolated iOS bug**
`/ios-qa` → `/investigate` → `/tdd` → `/ios-fix` → `/review`

The red test comes before the fix, not after it. A fix written first is a fix whose test can only confirm what already passes.

## Data and PostgreSQL

**Schema and queries**
`/domain-modeling` → `/postgresql-optimization` → `/tdd` → `/postgresql-code-review` → `/review` → `/ship`

**Slow query in production**
`/investigate` → `/postgresql-optimization` → `/benchmark` → `/canary`

## Application security

**Audit**
`/cso` → `/VibeSec-Skill` → `/investigate` → `/tdd` → `/review` → `/ship` → `/canary`

`/cso` covers the OWASP Top 10 and STRIDE. A finding without a regression test comes back: `/tdd` is not optional here.

**Hardening the agent session**
`git-guardrails-claude-code` → `/guard` → `/freeze` → `/skillspector` → `/unfreeze`

`/skillspector` before installing any third-party skill — a SKILL.md executes bash.

## DevEx and tooling

**Improving a repo's developer experience**
`/devex-review` → `/health` → `/setup-pre-commit` → `/document-generate` → `/wizard` → `/retro`

**Making a repo legible to agents**
`/graphify` → `/domain-audit` → `/improve-codebase-architecture` → `/writing-for-agents` → `/learn`

## Debugging, legacy, maintenance

**A bug that resists**
`/diagnosing-bugs` → `/freeze` → `/code-review` → `/ship` → `/learn`

No `/tdd` here, and that is deliberate: `/diagnosing-bugs` refuses to theorise until a command goes red, then fixes against that test. Appending `/tdd` asks for a red test that already exists.

**CI is red on a change you just made**
`/investigate` → `/tdd` → `/review` → `/ship`

Read the failing job's log first. A pipeline usually names its own cause, and reaching for `/investigate` on a cause you can already read is the subtraction step failing. When the failure is flaky rather than caused, `/diagnosing-bugs` instead — it refuses to theorise until it reproduces.

**Picking up a codebase you did not write**
`/graphify` → `/domain-audit` → `/health` → `/improve-codebase-architecture` → `/triage`

**An overflowing backlog**
`/triage` → `/grilling` → `/implement` → `/review` → `/ship`

**A merge conflict, right now**
`/resolving-merge-conflicts`

A chain of one, and it is the right answer. Do not pad it.

## Documentation

**Documenting a project that has none**
`/document-generate` → `/diagram` → `/make-pdf`

**Updating after a ship**
`/ship` → `/document-release` → `/retro` → `/learn`

**Writing an article or a long note**
`/writing-fragments` → `/writing-beats` → `/writing-shape` → `/make-pdf`

## Research and scraping

**A question to document from primary sources**
`/research` → `/scrape` → `/graphify` → `/make-pdf`

**Extraction from a hostile site**
`/scrape` → `/browse` → `/scrapling-official` → `/skillify`

Auth or interaction → `/browse`. Anti-bot wall → scrapling. Once the flow works, `/skillify` freezes it.

## Meta

**I am missing a capability**
`/find-skills` → `/skillspector` → `/skill-creator:skill-creator` → `superpowers:writing-skills` → `/benchmark-models` → `/learn`

**Learning instead of delegating**
`/teach` → `/grill-me` → `/prototype` → `/wait-what`

## Fixes on already-diagnosed defects

Common, and absent from the chains above because it starts in the middle: a review has produced verified defects, with file, line and mechanism.

`/freeze` → `/tdd` ×N → `/to-tickets` → `/implement` ×N → `/code-review` → `/review` → `/ship`

The red test comes before the ticket, not the other way round: a guard rail disabled in silence only stays fixed if a test fails on today's code. `/to-tickets` becomes necessary as soon as one fix waits on another — a missing schema change, an absent fixture. Add `/cso` when one of the defects is a class of flaw, because a bypassed guard rarely implies only one.

---
name: which-skill
description: Recommends which skill, or which ordered chain of skills, to run for the task at hand — across every installed pack. Use it whenever the request is about choosing the tool rather than doing the work — "which skill", "what should I use", "what's the right workflow", "where do I start", "how do I approach this". Use it too when someone pastes a review report, a bug, a plan or a backlog and asks how to proceed, because what they want is an order of operations, not the execution. Prefer this skill over answering from memory — a developer with several packs installed has many skills that do almost the same job, and arbitrating between them is worth far more than listing them.
---

# Which skill to run

You route. You do not do the work.

The failure mode this skill exists to remove: naming every plausible skill. A list of nine names is worse than no answer — the person walks away holding the entire arbitration, which is the problem they came with. Your output is a chain, an order, and the arbitration already settled.

## Before you route: the catalogue must be real

`references/catalogue.md` lists the skills actually installed on **this** machine. It is generated, never hand-written.

**If it is missing, or still carries the `NOT GENERATED` marker, run `scripts/build-catalogue.sh` before routing.** Routing against someone else's catalogue is the one way this skill produces confident, useless answers: it will name commands the person does not have. Regenerate it too whenever it looks stale — packs get installed and removed.

## Method

### 1. Place the request in the loop

Five positions. The position decides which third of the catalogue is even relevant.

| Position | What is true | Where to look |
|---|---|---|
| **Framing** | Nobody knows what to build yet, or not precisely enough | `/office-hours`, `/spec`, `/grill-with-docs`, `superpowers:brainstorming`, `/wayfinder` |
| **Building** | The what is settled; it remains to be done | `/implement`, `/tdd`, `/to-tickets`, `/codebase-design` |
| **Checking** | It is built — does it work, is it safe, does it look right | `/qa`, `/review`, `/cso`, `/design-review`, `/benchmark` |
| **Shipping** | It works and has to go out and be watched | `/ship`, `/land-and-deploy`, `/canary`, `/document-release` |
| **Inheriting** | The code exists and is not ours | `/graphify`, `/domain-audit`, `/triage`, `/diagnosing-bugs` |

A request spanning several positions yields a chain that crosses them in order. A request covering one position yields a short chain, and that is fine.

### 2. Subtract what is already done

This is the step routers skip, and the one that decides whether the answer is worth anything.

People rarely arrive cold. Someone describing a bug with line numbers, the full mechanism, and a grep that returned nothing has finished their diagnosis. Handing them `/investigate` asks them to redo, in front of you, what they just did. That is the kind of answer after which nobody opens the router again.

Reread what they wrote and look for evidence that steps are behind them:

- a cause localised to the line, a mechanism explained → **the diagnosis is done**; no `/investigate`, no `/diagnosing-bugs`
- a spec, a plan, tickets, numbered criteria quoted → **the framing is done**; no `/spec`, no `/office-hours`
- before/after numbers, a profile, a benchmark → **the measurement is done**
- "the review found", "I checked myself" → **the review is done**; no `/review` at the head of the chain
- fixtures or tests cited as existing → **the harness is there**

Every step you find leaves the chain and moves into "what you do not run". Saying so explicitly is what proves you read instead of pattern-matching on keywords.

### 3. Compose the chain

Read `references/chains.md`: it holds the canonical chains by kind of work (web, design, backend, 0→1, iOS, data, security, DevEx, legacy, docs, scraping, meta). Start from the one that matches, then remove the steps subtracted in step 2 and the ones the situation does not justify.

Those chains are a starting point, not a rail. A specific situation deserves a specific chain; copying out twelve steps when the person has three to do is falling back into the list.

### 4. Arbitrate the duplicates

As soon as the chain touches debugging, TDD, code review, framing or handover, read `references/arbitration.md`. Several packs cover this ground with different skills that do not do the same thing, and choosing on the person's behalf is this skill's main service.

Never offer two competing skills and leave the choice open. Decide, and give the reason in one line.

**Also read `~/.which-skill/arbitration.local.md` if it exists.** That is where this person settles their own duplicates, and it wins over the shipped file on any skill both mention. The shipped arbitration is fixed prose about specific skills; theirs is about the skills they actually run.

It sits outside the skill folder on purpose: `npx skills update` replaces a skill by overwriting its directory, so anything hand-written inside it is destroyed without warning. If you find one at the old path — `references/arbitration.local.md` — read it anyway, and tell the person to run `scripts/build-catalogue.sh`, which moves it somewhere an update cannot reach.

**And check the end of the catalogue.** `build-catalogue.sh` appends a *Possible unarbitrated overlap* section when it finds several installed skills covering the same ground with no published argument between them. If the terrain you are routing through appears there, say so plainly rather than picking silently:

> You have three review skills installed — `/review`, `/superpowers:receiving-code-review`, `/postgresql-code-review` — and I have an argument for only one of them. I am putting `/review` in the chain because it is the pre-landing pass, but treat that as a default, not a verdict. Writing the missing argument into `~/.which-skill/arbitration.local.md` is worth more than any answer I can give you here.

That admission is not a weakness of the answer, it is the honest edge of it. A router that hides the gap is the one that sends people to the wrong skill with confidence.

### 5. Name what you do not run

Always present, never empty. Two sources: the steps subtracted in step 2, and the skills the person could reasonably have considered but that do not fit here. One line of reason each.

This is the section that turns a recommendation into a decision.

## Output format

Answer in the person's language. Keep this skeleton:

```
## The chain

`/a` → `/b` → `/c`

## Why

(one entry per step that needs justifying — not per step.
The obvious ones do not need a paragraph.)

## What you do not run

- `/x` — one-line reason
- `/y` — one-line reason
```

Add, only when the situation calls for it:

- **A precondition** — a setup skill is missing (`/setup-matt-pocock-skills` before the first `/to-tickets`, `/setup-deploy` before `/land-and-deploy`, `/setup-browser-cookies` before QA behind a login).
- **An observation** — when the situation has a structural property the chain alone does not capture. Three defects sharing one shape call for a sweep of the class, not three point fixes. That kind of remark is often worth more than the chain; do not keep it to yourself.

Close by offering to run the first step. The person arrived with a problem, not with an appetite for reading a plan.

## Hard rules

**Never invent a skill name.** The installed catalogue is `references/catalogue.md`, regenerated by `scripts/build-catalogue.sh`. A name absent from the catalogue does not exist, however obvious it seems that it should. If nothing covers the need, say so plainly and offer `/find-skills` to look for one to install, or `/skill-creator:skill-creator` to write it.

**Three to seven steps.** Past seven, you did not do step 2.

**You do not do the work.** Even when the first step is obvious and you could just run it. Offer, and wait.

**A single skill is a valid answer.** `/resolving-merge-conflicts` on a live conflict is a chain of one. Do not pad it to look thorough.

The padding always arrives the same way, so watch for it by name: **steps that will be true later are not part of the answer to a question about now.** Someone mid-rebase will eventually run `/review` and `/ship` — that does not make them the next move, and appending them turns a precise answer into a generic one. Ask what the person does in the next ten minutes. If a step does not belong in that window, it belongs in the closing line at most, not in the chain.

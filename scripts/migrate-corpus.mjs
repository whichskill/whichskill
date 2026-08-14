#!/usr/bin/env node
/**
 * One-shot migration from the source corpus into this repo's format.
 *
 *   ~/.claude/skills/which-skill/references/chaines.md    -> corpus/pending/*.md
 *   ~/.claude/skills/which-skill/references/arbitrage.md  -> (reported, migrated by hand)
 *   every SKILL.md under ~/.claude/skills                 -> src/data/skills.json
 *
 * It produces STRUCTURE, never prose. Every step lands with an empty `why`,
 * because the `why` is the product and has to be written by a person — see the
 * design doc, which budgets ~15h for exactly this and calls it non-delegable.
 * Structurally-migrated chains land in corpus/pending/ and are NOT part of the
 * build: a chain becomes real when someone writes its reasons and moves it into
 * src/content/chains/.
 *
 * Usage: node scripts/migrate-corpus.mjs [--write]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = process.env.CLAUDE_SKILLS_DIR ?? join(homedir(), '.claude/skills');
const REFS = join(SKILLS_DIR, 'which-skill/references');
const WRITE = process.argv.includes('--write');

/** The Matt Pocock engineering suite does not tag itself, so it is listed. */
const MATT = new Set(
  `ask-matt setup-matt-pocock-skills grilling grill-me grill-with-docs prototype handoff
   to-spec to-tickets implement tdd code-review triage diagnosing-bugs wayfinder
   improve-codebase-architecture codebase-design domain-modeling research to-questionnaire
   wizard wait-what teach resolving-merge-conflicts writing-for-agents loop-me
   migrate-to-shoehorn scaffold-exercises setup-pre-commit pick-ui-library`.split(/\s+/),
);

/** Things the corpus cites that are not installed skills. */
const EXTRAS = [
  { id: 'harness/compact', name: '/compact', pack: 'harness', kind: 'native' },
  { id: 'harness/code-simplifier', name: 'code-simplifier', pack: 'harness', kind: 'agent' },
];

const slugOf = (raw) => raw.trim().replace(/^\//, '');

function packOf(slug, description) {
  if (slug.includes(':')) return slug.split(':')[0];
  if (MATT.has(slug)) return 'matt-pocock';
  if (/\(gstack\)\s*$/.test(description ?? '')) return 'gstack';
  return 'specialized';
}

function description(file) {
  const raw = readFileSync(file, 'utf8');
  const m = /^description:\s*(.*)$/m.exec(raw);
  return m ? m[1].replace(/^["']|["']$/g, '') : '';
}

/** Every SKILL.md on disk. Globs follow symlinks; `find` without -L does not. */
function installedSkills() {
  const out = new Map();
  for (const entry of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    const file = join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!existsSync(file)) continue;
    const desc = description(file);
    const pack = packOf(entry.name, desc);
    out.set(entry.name, { id: `${pack}/${entry.name}`, name: `/${entry.name}`, pack, kind: 'skill' });
  }
  return out;
}

/** Parse chaines.md into { title, description, refs[] }. */
function parseChains(md) {
  const chains = [];
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const head = /^\*\*(.+?)\*\*(?:\s+—\s+(.*))?$/.exec(lines[i]);
    if (!head) continue;
    // The chain line is the next non-empty line and must contain an arrow or a single backtick ref.
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    const chainLine = lines[j] ?? '';
    const refs = [...chainLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((r) => /^[/\w]/.test(r));
    if (refs.length === 0) continue;
    chains.push({ title: head[1].trim(), description: (head[2] ?? '').trim(), refs });
  }
  return chains;
}

const kebab = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/**
 * Every backticked skill reference in a file, wherever it sits in the prose.
 * arbitrage.md is migrated by hand, but its references still have to end up in
 * skills.json or the hand-written arbitrations will not resolve.
 */
function looseRefs(md) {
  return [...md.matchAll(/`(\/?[a-z0-9][a-z0-9:-]*)`/g)]
    .map((m) => m[1])
    .filter((r) => !/^(git|npm|npx|bun|node)\b/.test(r));
}

function main() {
  const installed = installedSkills();
  const chains = parseChains(readFileSync(join(REFS, 'chaines.md'), 'utf8'));
  const arbitrationRefs = looseRefs(readFileSync(join(REFS, 'arbitrage.md'), 'utf8'));

  // Resolve every ref the corpus actually uses, from both source files.
  const used = new Map();
  const unresolved = new Set();
  const allRefs = [...chains.flatMap((c) => c.refs), ...arbitrationRefs];
  for (const raw of allRefs) {
    const slug = slugOf(raw);
    if (slug.includes(':')) {
      const [pack, ...rest] = slug.split(':');
      const name = rest.join(':');
      // `name` is what you type. For a plugin skill that is `/pack:skill`, which
      // is NOT derivable from the id, so it is stored rather than reconstructed.
      used.set(`${pack}/${name}`, { id: `${pack}/${name}`, name: `/${slug}`, pack, kind: 'skill' });
      continue;
    }
    const hit = installed.get(slug);
    if (hit) used.set(hit.id, hit);
    else unresolved.add(slug);
  }
  for (const extra of EXTRAS) {
    used.set(extra.id, extra);
    unresolved.delete(extra.name.replace(/^\//, ''));
  }

  const skills = [...used.values()].sort((a, b) => a.id.localeCompare(b.id));

  console.log(`chains parsed:      ${chains.length}`);
  console.log(`refs resolved:      ${skills.length} distinct`);
  console.log(`refs unresolved:    ${unresolved.size}${unresolved.size ? ' -> ' + [...unresolved].join(', ') : ''}`);

  if (!WRITE) {
    console.log('\ndry run. pass --write to emit src/data/skills.json and corpus/pending/');
    return;
  }

  mkdirSync(join(ROOT, 'src/data'), { recursive: true });
  writeFileSync(join(ROOT, 'src/data/skills.json'), JSON.stringify(skills, null, 2) + '\n');

  const pending = join(ROOT, 'corpus/pending');
  mkdirSync(pending, { recursive: true });
  const seenSlugs = new Set();
  for (const chain of chains) {
    const slug = kebab(chain.title);
    // Two titles that kebab to the same string would silently overwrite one
    // chain with another, and the loss would only show up as a missing page.
    if (seenSlugs.has(slug)) {
      console.warn(`  WARNING: slug collision on "${slug}" — "${chain.title}" overwrites an earlier chain`);
    }
    seenSlugs.add(slug);
    const steps = chain.refs
      .map((raw) => {
        const s = slugOf(raw);
        const id = s.includes(':') ? s.replace(':', '/') : (installed.get(s)?.id ?? s);
        return `  - ref: ${id}\n    why: ""`;
      })
      .join('\n');
    const body = `---
situation: ${JSON.stringify(chain.title)}
title: ${JSON.stringify(chain.title.endsWith('.') ? chain.title : chain.title + '.')}
verdict: ""
steps:
${steps}
---

${chain.description}
`;
    writeFileSync(join(pending, `${slug}.md`), body);
  }
  console.log(`\nwrote src/data/skills.json (${skills.length} entries)`);
  console.log(`wrote corpus/pending/ (${chains.length} chains, every why empty on purpose)`);
}

main();

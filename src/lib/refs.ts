/**
 * Reference normalisation and corpus integrity.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The design doc assumed Astro's `reference()` would fail the build on a
 * reference to a skill that does not exist. It does not. Read
 * `astro/dist/content/runtime.js` (createReference): the returned schema maps a
 * string to `{ id, collection }` and only checks that an *object* form carries a
 * matching collection name. Existence is never verified at parse time — a dead
 * reference surfaces later, as `undefined` from `getEntry()`, and only if some
 * page happens to dereference it.
 *
 * That is precisely the silent rot this project exists to refuse. So the
 * existence guarantee is implemented here instead, and run before rendering.
 *
 *   corpus (markdown frontmatter)      skills.json
 *            |                              |
 *            +---------> checkIntegrity <---+
 *                              |
 *                     problems[] -> throw -> build fails
 */

export type Kind = 'skill' | 'native' | 'agent';

export interface SkillEntry {
  /** `pack/slug` */
  id: string;
  name: string;
  pack: string;
  kind: Kind;
}

export interface Problem {
  file: string;
  field: string;
  ref: string;
  message: string;
}

/** `pack/slug` -> entry, plus `slug` -> all packs that publish it. */
export interface SkillIndex {
  byId: Map<string, SkillEntry>;
  bySlug: Map<string, string[]>;
}

export function buildIndex(entries: SkillEntry[]): SkillIndex {
  const byId = new Map<string, SkillEntry>();
  const bySlug = new Map<string, string[]>();
  for (const entry of entries) {
    if (byId.has(entry.id)) {
      throw new Error(`duplicate skill id in skills.json: ${entry.id}`);
    }
    byId.set(entry.id, entry);
    const slug = entry.id.slice(entry.id.indexOf('/') + 1);
    const packs = bySlug.get(slug) ?? [];
    packs.push(entry.id);
    bySlug.set(slug, packs);
  }
  return { byId, bySlug };
}

export class AmbiguousRefError extends Error {
  constructor(
    public readonly raw: string,
    public readonly candidates: string[],
  ) {
    super(
      `"${raw}" is ambiguous: ${candidates.join(', ')}. Write it as pack/slug.`,
    );
    this.name = 'AmbiguousRefError';
  }
}

/**
 * Turn any of the six spellings found in the source corpus into a `pack/slug` id.
 *
 *   /investigate                        bare slug, leading slash
 *   investigate                         bare slug
 *   gstack/investigate                  already an id
 *   superpowers:brainstorming           plugin form
 *   /superpowers:systematic-debugging   plugin form, leading slash
 *   code-simplifier                     bare slug that is an agent, not a skill
 *
 * A bare slug published by two packs is an error, never a guess.
 */
export function normalizeRef(raw: string, index: SkillIndex): string {
  const trimmed = raw.trim().replace(/^\//, '');
  if (trimmed === '') throw new Error('empty reference');

  // Already `pack/slug`.
  if (trimmed.includes('/')) return trimmed;

  // Plugin form `plugin:skill` — the plugin is the pack.
  if (trimmed.includes(':')) {
    const [pack, ...rest] = trimmed.split(':');
    return `${pack}/${rest.join(':')}`;
  }

  const candidates = index.bySlug.get(trimmed);
  if (!candidates || candidates.length === 0) return trimmed; // unresolved; reported by checkIntegrity
  if (candidates.length > 1) throw new AmbiguousRefError(raw, candidates);
  return candidates[0]!;
}

/** One reference found in one corpus document. */
export interface RefSite {
  file: string;
  field: string;
  ref: string;
  /** Which collection it must resolve against. */
  target: 'skills' | 'arbitrations';
}

/**
 * Which fields of which array hold a reference, and to which collection.
 * Adding a referencing field to content.config.ts means adding it here too —
 * a field missing from this table is a hole in the guarantee, not a small gap.
 */
const REF_FIELDS: ReadonlyArray<{
  array: string;
  key: string;
  target: 'skills' | 'arbitrations';
}> = [
  { array: 'steps', key: 'ref', target: 'skills' },
  { array: 'substitutes', key: 'ref', target: 'skills' },
  { array: 'substitutes', key: 'insteadOf', target: 'skills' },
  { array: 'notRun', key: 'ref', target: 'skills' },
  { array: 'notRun', key: 'seeArbitration', target: 'arbitrations' },
  { array: 'competitors', key: 'ref', target: 'skills' },
];

/** Pull every reference out of one parsed frontmatter object. */
export function collectRefs(file: string, data: Record<string, unknown>): RefSite[] {
  const sites: RefSite[] = [];
  for (const { array, key, target } of REF_FIELDS) {
    const items = Array.isArray(data[array]) ? (data[array] as unknown[]) : [];
    items.forEach((item, i) => {
      const value = (item as Record<string, unknown>)?.[key];
      // An empty string is reported, not skipped: silently dropping it would let
      // `ref: ""` through the gate and fail later, which is the whole failure
      // mode this file exists to close.
      if (typeof value === 'string') {
        sites.push({ file, field: `${array}[${i}].${key}`, ref: value, target });
      }
    });
  }
  return sites;
}

export interface CorpusDoc {
  file: string;
  data: Record<string, unknown>;
}

/**
 * Resolve every reference in the corpus.
 *
 * Skill references resolve against skills.json; `seeArbitration` resolves
 * against the set of arbitration ids actually on disk. Returns every problem
 * found — never stops at the first, so one build tells you everything that is
 * broken instead of making you play whack-a-mole.
 */
export function checkIntegrity(
  docs: CorpusDoc[],
  index: SkillIndex,
  arbitrationIds: ReadonlySet<string> = new Set(),
): Problem[] {
  const problems: Problem[] = [];
  for (const doc of docs) {
    for (const site of collectRefs(doc.file, doc.data)) {
      if (site.target === 'arbitrations') {
        if (!arbitrationIds.has(site.ref)) {
          problems.push({
            ...site,
            message: `"${site.ref}" is not an arbitration in src/content/arbitrations/.`,
          });
        }
        continue;
      }

      let id: string;
      try {
        id = normalizeRef(site.ref, index);
      } catch (err) {
        problems.push({
          ...site,
          message: err instanceof Error ? err.message : String(err),
        });
        continue;
      }
      if (!index.byId.has(id)) {
        problems.push({
          ...site,
          message: `"${site.ref}" resolves to "${id}", which is not in skills.json.`,
        });
        continue;
      }
      // The gate must be exactly as strict as the renderer. Astro resolves an
      // entry by its literal id, so `/investigate` would pass a lenient check
      // here and then fail at render. normalizeRef's leniency exists for the
      // migration script, not for content files.
      if (site.ref !== id) {
        problems.push({
          ...site,
          message: `"${site.ref}" is not a canonical id. Write it as "${id}".`,
        });
      }
    }
  }
  return problems;
}

export function formatProblems(problems: Problem[]): string {
  const lines = problems.map((p) => `  ${p.file} — ${p.field}: ${p.message}`);
  return [
    `Corpus integrity check failed: ${problems.length} bad reference${problems.length > 1 ? 's' : ''}.`,
    ...lines,
    '',
    'Skill references must resolve to an entry in src/data/skills.json;',
    'seeArbitration must name a file in src/content/arbitrations/.',
    'Nothing is published until they all do.',
  ].join('\n');
}

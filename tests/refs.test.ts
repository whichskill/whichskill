import { describe, expect, it } from 'vitest';
import {
  AmbiguousRefError,
  buildIndex,
  checkIntegrity,
  collectRefs,
  formatProblems,
  normalizeRef,
  type SkillEntry,
} from '../src/lib/refs.ts';

const entries: SkillEntry[] = [
  { id: 'gstack/investigate', name: '/investigate', pack: 'gstack', kind: 'skill' },
  { id: 'gstack/review', name: '/review', pack: 'gstack', kind: 'skill' },
  { id: 'matt-pocock/code-review', name: '/code-review', pack: 'matt-pocock', kind: 'skill' },
  { id: 'superpowers/systematic-debugging', name: '/superpowers:systematic-debugging', pack: 'superpowers', kind: 'skill' },
  { id: 'harness/compact', name: '/compact', pack: 'harness', kind: 'native' },
  { id: 'harness/code-simplifier', name: 'code-simplifier', pack: 'harness', kind: 'agent' },
  // Deliberate collision: two packs publish a skill called `code-review`.
  { id: 'other/code-review', name: '/code-review', pack: 'other', kind: 'skill' },
];

const index = buildIndex(entries);

describe('buildIndex', () => {
  it('rejects a duplicate id rather than silently keeping one', () => {
    expect(() => buildIndex([entries[0]!, entries[0]!])).toThrow(/duplicate skill id/);
  });

  it('groups every pack that publishes the same slug', () => {
    expect(index.bySlug.get('code-review')).toEqual(['matt-pocock/code-review', 'other/code-review']);
  });
});

describe('normalizeRef — the six spellings in the source corpus', () => {
  it('strips a leading slash', () => {
    expect(normalizeRef('/investigate', index)).toBe('gstack/investigate');
  });

  it('accepts a bare slug', () => {
    expect(normalizeRef('investigate', index)).toBe('gstack/investigate');
  });

  it('passes through an id that is already pack/slug', () => {
    expect(normalizeRef('gstack/investigate', index)).toBe('gstack/investigate');
  });

  it('reads the plugin form as pack:skill', () => {
    expect(normalizeRef('superpowers:systematic-debugging', index)).toBe(
      'superpowers/systematic-debugging',
    );
  });

  it('reads the plugin form with a leading slash', () => {
    expect(normalizeRef('/superpowers:systematic-debugging', index)).toBe(
      'superpowers/systematic-debugging',
    );
  });

  it('resolves a bare agent name', () => {
    expect(normalizeRef('code-simplifier', index)).toBe('harness/code-simplifier');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeRef('  /review  ', index)).toBe('gstack/review');
  });

  it('rejects an empty reference', () => {
    expect(() => normalizeRef('   ', index)).toThrow(/empty reference/);
  });
});

describe('normalizeRef — ambiguity is an error, never a guess', () => {
  it('throws when two packs publish the same slug', () => {
    expect(() => normalizeRef('code-review', index)).toThrow(AmbiguousRefError);
  });

  it('names both candidates so the author knows what to write instead', () => {
    try {
      normalizeRef('code-review', index);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AmbiguousRefError);
      expect((err as AmbiguousRefError).candidates).toEqual([
        'matt-pocock/code-review',
        'other/code-review',
      ]);
    }
  });

  it('lets a fully qualified id through even when the bare slug is ambiguous', () => {
    expect(normalizeRef('matt-pocock/code-review', index)).toBe('matt-pocock/code-review');
  });
});

describe('collectRefs', () => {
  it('finds references in every field that can hold one', () => {
    const sites = collectRefs('x.md', {
      steps: [{ ref: '/investigate' }, { ref: '/review' }],
      substitutes: [{ ref: '/review', insteadOf: '/investigate' }],
      notRun: [{ ref: '/compact', seeArbitration: 'three-debuggers' }],
      competitors: [{ ref: '/investigate' }],
    });
    expect(sites.map((s) => s.field)).toEqual([
      'steps[0].ref',
      'steps[1].ref',
      'substitutes[0].ref',
      'substitutes[0].insteadOf',
      'notRun[0].ref',
      'notRun[0].seeArbitration',
      'competitors[0].ref',
    ]);
  });

  it('ignores a document with no references at all', () => {
    expect(collectRefs('x.md', { title: 'nothing here.' })).toEqual([]);
  });
});

const ARBITRATIONS = new Set(['three-debuggers']);

describe('checkIntegrity', () => {
  it('passes a corpus whose references all resolve', () => {
    const problems = checkIntegrity(
      [
        {
          file: 'a.md',
          data: { steps: [{ ref: 'gstack/investigate' }, { ref: 'harness/compact' }] },
        },
      ],
      index,
      ARBITRATIONS,
    );
    expect(problems).toEqual([]);
  });

  it('reports a dead reference with its file and its field', () => {
    const problems = checkIntegrity(
      [{ file: 'chains/a.md', data: { steps: [{ ref: 'gstack/nope' }] } }],
      index,
      ARBITRATIONS,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ file: 'chains/a.md', field: 'steps[0].ref' });
  });

  it('reports every problem, not just the first', () => {
    const problems = checkIntegrity(
      [
        { file: 'a.md', data: { steps: [{ ref: 'gstack/nope' }, { ref: 'gstack/also-nope' }] } },
        { file: 'b.md', data: { notRun: [{ ref: 'gstack/still-nope' }] } },
      ],
      index,
      ARBITRATIONS,
    );
    expect(problems).toHaveLength(3);
    expect(problems.map((p) => p.file)).toEqual(['a.md', 'a.md', 'b.md']);
  });

  it('treats an ambiguous reference as a problem rather than throwing', () => {
    const problems = checkIntegrity(
      [{ file: 'a.md', data: { steps: [{ ref: 'code-review' }] } }],
      index,
      ARBITRATIONS,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/ambiguous/);
  });

  // The gate must be exactly as strict as Astro's renderer, which resolves by
  // literal id. A lenient gate would pass a file that then breaks at render.
  it('rejects a non-canonical spelling even though it resolves', () => {
    const problems = checkIntegrity(
      [{ file: 'a.md', data: { steps: [{ ref: '/investigate' }] } }],
      index,
      ARBITRATIONS,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/Write it as "gstack\/investigate"/);
  });

  it('reports an empty reference instead of skipping it', () => {
    const problems = checkIntegrity([{ file: 'a.md', data: { steps: [{ ref: '' }] } }], index, ARBITRATIONS);
    expect(problems).toHaveLength(1);
  });

  it('resolves seeArbitration against the arbitrations on disk', () => {
    const ok = checkIntegrity(
      [
        {
          file: 'a.md',
          data: { notRun: [{ ref: 'gstack/investigate', seeArbitration: 'three-debuggers' }] },
        },
      ],
      index,
      ARBITRATIONS,
    );
    expect(ok).toEqual([]);
  });

  it('catches a seeArbitration pointing at an arbitration that does not exist', () => {
    const problems = checkIntegrity(
      [
        {
          file: 'chains/a.md',
          data: { notRun: [{ ref: 'gstack/investigate', seeArbitration: 'no-such-fight' }] },
        },
      ],
      index,
      ARBITRATIONS,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ field: 'notRun[0].seeArbitration' });
    expect(problems[0]!.message).toMatch(/not an arbitration/);
  });
});

describe('formatProblems', () => {
  it('names the file, the field and what to do about it', () => {
    const text = formatProblems([
      { file: 'chains/a.md', field: 'steps[0].ref', ref: '/nope', message: 'not in skills.json.' },
    ]);
    expect(text).toContain('chains/a.md');
    expect(text).toContain('steps[0].ref');
    expect(text).toContain('skills.json');
    expect(text).toContain('Nothing is published until they all do.');
  });
});

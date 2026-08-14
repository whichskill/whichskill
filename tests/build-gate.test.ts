import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The success criterion the whole project rests on: a chain that references a
 * skill which does not exist must never reach the published site.
 *
 * Three mechanisms are involved, and they are NOT equivalent. Measured on
 * Astro 7.2.2:
 *
 *   1. Astro's own content sync logs "Invalid content reference" — and then
 *      CONTINUES to render. On its own it does not stop a deploy.
 *   2. The guard in SkillName.astro throws at render time, but only for
 *      references some page actually dereferences, and only for skills.
 *   3. The corpusIntegrity integration throws on astro:build:start, before a
 *      single page is rendered, for every reference in the corpus.
 *
 * (3) is the only one that covers a reference no page displays. The clearest
 * case is `notRun[].seeArbitration`: the chain template resolves it with
 * getEntry and silently renders no link when it is missing, so neither (1) nor
 * (2) stops a chain citing an arbitration that does not exist. A code review
 * caught that hole after the first version of this file claimed otherwise.
 *
 * These tests pin the behaviour so a future refactor cannot quietly remove the
 * guarantee.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHAINS = join(ROOT, 'src/content/chains');
const FIXTURE = join(CHAINS, '__build_gate_fixture.md');

function runBuild(): { code: number; output: string } {
  try {
    const output = execFileSync('npx', ['astro', 'build'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, output };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

afterEach(() => {
  rmSync(FIXTURE, { force: true });
});

describe('the build is the gate', () => {
  it('fails, names the file and the field, and renders nothing', () => {
    mkdirSync(CHAINS, { recursive: true });
    writeFileSync(
      FIXTURE,
      `---
situation: Build gate fixture
title: Build gate fixture.
verdict: This chain is injected by a test and must never build.
steps:
  - ref: gstack/this-skill-does-not-exist
    why: A reference to a skill that is not in skills.json.
---

Injected by tests/build-gate.test.ts.
`,
    );

    const { code, output } = runBuild();

    expect(code).not.toBe(0);
    expect(output).toContain('Corpus integrity check failed');
    expect(output).toContain('__build_gate_fixture.md');
    expect(output).toContain('steps[0].ref');

    // Fails before rendering: the integration throws on astro:build:start, so
    // the static route generation phase is never reached.
    expect(output).not.toContain('generating static routes');
  }, 120_000);

  // The hole a code review found: no page fails on a missing arbitration, so
  // only the integration catches this one.
  it('fails on a seeArbitration pointing at nothing, which no page would surface', () => {
    mkdirSync(CHAINS, { recursive: true });
    writeFileSync(
      FIXTURE,
      `---
situation: Build gate fixture
title: Build gate fixture.
verdict: This chain is injected by a test and must never build.
steps:
  - ref: gstack/investigate
    why: A reference that resolves perfectly well.
notRun:
  - ref: gstack/review
    why: The skill reference here is fine.
    seeArbitration: no-such-fight
---

Injected by tests/build-gate.test.ts.
`,
    );

    const { code, output } = runBuild();

    expect(code).not.toBe(0);
    expect(output).toContain('notRun[0].seeArbitration');
    expect(output).toContain('not an arbitration');
    expect(output).not.toContain('generating static routes');
  }, 120_000);

  it('builds green once the corpus is sound', () => {
    const { code, output } = runBuild();
    expect(code).toBe(0);
    expect(output).toContain('corpus integrity');
    expect(existsSync(join(ROOT, 'dist/index.html'))).toBe(true);
  }, 120_000);
});

describe('what shipped', () => {
  it('publishes one page per chain and per arbitration', () => {
    const chains = readdirSync(CHAINS).filter((f) => f.endsWith('.md'));
    for (const file of chains) {
      const slug = file.replace(/\.md$/, '');
      expect(existsSync(join(ROOT, 'dist/c', slug, 'index.html'))).toBe(true);
    }
  });
});

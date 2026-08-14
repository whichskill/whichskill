import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { CorpusDoc, SkillEntry } from './refs.ts';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Read the frontmatter of one markdown file.
 * Deliberately independent of Astro's content layer: the integrity check must be
 * runnable from a plain unit test, without booting a build.
 */
export function readFrontmatter(path: string): Record<string, unknown> {
  const raw = readFileSync(path, 'utf8');
  const match = FRONTMATTER.exec(raw);
  if (!match) throw new Error(`${path}: no frontmatter`);
  const data = parseYaml(match[1]!);
  if (data === null || typeof data !== 'object') throw new Error(`${path}: frontmatter is not a mapping`);
  return data as Record<string, unknown>;
}

/**
 * Recursive on purpose: the Astro loaders use `**\/*.md`, so a chain filed in a
 * subdirectory is published. A non-recursive walk here would let that chain skip
 * the integrity check entirely — a hole in the guarantee, not a small gap.
 */
function markdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(path);
  }
  return out.sort();
}

/** Every chain and arbitration on disk, keyed by a repo-relative path for error messages. */
export function loadCorpus(root: string): CorpusDoc[] {
  const dirs = [join(root, 'src/content/chains'), join(root, 'src/content/arbitrations')];
  return dirs.flatMap((dir) =>
    markdownFiles(dir).map((path) => ({
      file: relative(root, path),
      data: readFrontmatter(path),
    })),
  );
}

/**
 * The ids a `seeArbitration` reference can legally point at. Astro's glob loader
 * derives an entry id from the path relative to the collection base, minus the
 * extension — so a nested file is `sub/name`, not `name`.
 */
export function loadArbitrationIds(root: string): Set<string> {
  const base = join(root, 'src/content/arbitrations');
  return new Set(markdownFiles(base).map((path) => relative(base, path).replace(/\.md$/, '')));
}

/** skills.json, as the flat array the index wants. */
export function loadSkills(root: string): SkillEntry[] {
  const path = join(root, 'src/data/skills.json');
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('src/data/skills.json must be an array');
  return parsed as SkillEntry[];
}

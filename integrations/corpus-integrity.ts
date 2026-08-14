import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { loadArbitrationIds, loadCorpus, loadSkills } from '../src/lib/corpus.ts';
import { buildIndex, checkIntegrity, formatProblems } from '../src/lib/refs.ts';

/**
 * Fails the build when any chain or arbitration references a skill that is not
 * in skills.json.
 *
 * This exists because Astro's `reference()` does NOT check existence at parse
 * time — see the note at the top of src/lib/refs.ts. Without this integration
 * the site would happily publish a chain pointing at a skill that no longer
 * exists, which is the exact failure mode the project is built to refuse.
 *
 * It runs on `astro:build:start`, before a single page is rendered, so a broken
 * corpus never produces output for the host to deploy.
 */
export function corpusIntegrity(): AstroIntegration {
  return {
    name: 'whichskill:corpus-integrity',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const root = fileURLToPath(new URL('..', import.meta.url));
        const index = buildIndex(loadSkills(root));
        const arbitrations = loadArbitrationIds(root);
        const problems = checkIntegrity(loadCorpus(root), index, arbitrations);
        if (problems.length > 0) {
          throw new Error(formatProblems(problems));
        }
        logger.info(
          `corpus integrity: ${index.byId.size} skills, ${arbitrations.size} arbitrations, every reference resolves`,
        );
      },
    },
  };
}

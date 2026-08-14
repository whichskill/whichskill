// @ts-check
import { defineConfig } from 'astro/config';
import { corpusIntegrity } from './integrations/corpus-integrity.ts';

// Static output, and the build is the gate. `corpusIntegrity` runs before any
// page is rendered and throws on a reference that does not resolve, so the
// host's git integration never publishes a chain pointing at nothing.
// See DESIGN.md and src/lib/refs.ts for why this is not free with Astro.
export default defineConfig({
  site: 'https://whichskill.dev',
  output: 'static',
  integrations: [corpusIntegrity()],
});

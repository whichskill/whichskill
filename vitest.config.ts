import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // The build-gate suite shells out to `astro build` twice. Run files in
    // sequence so two builds never fight over dist/.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});

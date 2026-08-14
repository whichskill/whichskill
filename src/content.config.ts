import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
// Imported directly: re-exporting `z` from astro:content is deprecated in Astro 7.
import { z } from 'zod';

/**
 * The nine arbitrated terrains. Closed on purpose: a chain can only claim an
 * arbitration for a terrain that actually has one written.
 */
export const TERRAINS = [
  'debug',
  'tdd',
  'review',
  'framing',
  'splitting',
  'handover',
  'routing',
  'skill-making',
  'session-safety',
] as const;

/**
 * What a reference can point at.
 *  skill  — a SKILL.md from a declared pack (plugins included)
 *  native — a harness command with no repo of its own (/compact)
 *  agent  — a subagent, not a skill (code-simplifier)
 */
export const KINDS = ['skill', 'native', 'agent'] as const;

const skills = defineCollection({
  loader: file('src/data/skills.json'),
  schema: z.object({
    name: z.string(),
    pack: z.string(),
    kind: z.enum(KINDS),
  }),
});

/**
 * One step of a chain.
 *
 * `why` is required and non-empty. It is the product: without it a chain page is
 * a list of skill names, which is the catalogue this project exists to reject.
 * An empty `why` is a build failure, not a warning.
 */
const step = z.object({
  ref: reference('skills'),
  why: z.string().min(1, 'every step needs a why — it is the product'),
  /** `×N` appears four times in the source corpus, so the field earns its place. */
  repeat: z.union([z.number().int().positive(), z.literal('N')]).optional(),
  produces: z.string().optional(),
});

const chains = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chains' }),
  schema: z.object({
    situation: z.string(),
    /** Sentence-cased with a hard full stop. An assertion, not a catalogue entry. */
    title: z.string().regex(/\.$/, 'chain titles end in a full stop'),
    verdict: z.string().min(1),
    subtitle: z.string().optional(),
    steps: z.array(step).min(1),
    substitutes: z
      .array(
        z.object({
          ref: reference('skills'),
          insteadOf: reference('skills'),
          why: z.string().min(1),
        }),
      )
      .optional(),
    /** ref points at a skill OR at an arbitration slug. The chain cites, the arbitration holds. */
    notRun: z
      .array(
        z.object({
          ref: reference('skills'),
          why: z.string().min(1),
          seeArbitration: reference('arbitrations').optional(),
        }),
      )
      .optional(),
    /**
     * A closing remark. Deliberately NOT anchored to a step index: the source
     * corpus puts its remarks after the whole chain, so an `afterStep` field
     * would have been a constant. See DESIGN.md.
     */
    note: z.string().optional(),
  }),
});

const arbitrations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/arbitrations' }),
  schema: z.object({
    terrain: z.enum(TERRAINS),
    title: z.string().regex(/\.$/, 'arbitration titles end in a full stop'),
    verdict: z.string().min(1),
    competitors: z
      .array(
        z
          .object({
            ref: reference('skills'),
            wins: z.boolean(),
            why: z.string().min(1),
            whenItWins: z.string().optional(),
          })
          // Enforced, not just documented: taking a position is not the same as
          // pretending the alternatives are worthless. CLAUDE.md makes this a
          // copy rule, so the schema holds it rather than trusting the author.
          .refine((c) => c.wins || (c.whenItWins?.length ?? 0) > 0, {
            message: 'every loser needs a whenItWins line',
            path: ['whenItWins'],
          }),
      )
      .min(2, 'an arbitration with one contender is not an arbitration'),
    noneOfThem: z.string().optional(),
  }),
});

export const collections = { skills, chains, arbitrations };

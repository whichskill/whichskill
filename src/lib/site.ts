import packsData from '../data/packs.json' with { type: 'json' };

export interface Pack {
  pack: string;
  label: string;
  /** null when the upstream repo has not been verified. Never invent one. */
  repoUrl: string | null;
  installCmd: string | null;
  license: string | null;
}

const packs = packsData as Pack[];
const byPack = new Map(packs.map((p) => [p.pack, p]));

export function packOf(pack: string): Pack | undefined {
  return byPack.get(pack);
}

/**
 * Split `pack/slug` into its parts. Ids are built by the migration and validated
 * by the integrity check, so a missing slash here is a programming error.
 */
export function splitId(id: string): { pack: string; slug: string } {
  const at = id.indexOf('/');
  if (at < 0) throw new Error(`malformed skill id: ${id}`);
  return { pack: id.slice(0, at), slug: id.slice(at + 1) };
}

export const SITE_NAME = 'whichskill';
export const TAGLINE = 'Ordered chains of agent skills, indexed by situation.';

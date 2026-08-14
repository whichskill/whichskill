/**
 * The verdict is written as prose with commands in it ("Run /diagnosing-bugs.
 * Not /investigate."). Both page templates need the commands set in mono, so the
 * markup lives here rather than being copy-pasted into each template.
 *
 * The pattern deliberately matches the same shapes `normalizeRef` accepts, so a
 * command written in the plugin form (`/superpowers:brainstorming`) is marked up
 * as one token instead of being cut at the colon.
 */
const COMMAND = /(\/[a-z0-9][a-z0-9-]*(?::[a-z0-9][a-z0-9-]*)?)/g;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderVerdict(text: string): string {
  return escapeHtml(text).replace(COMMAND, '<code>$1</code>');
}

/**
 * Escapes regex syntax characters so the string can be used as a literal
 * pattern with the `RegExp()` constructor.
 *
 * Replacement for `RegExp.escape()` (ES2025) to keep compatibility with
 * runtimes that do not support it yet (e.g. Node.js 20 / 22 LTS).
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, String.raw`\$&`);
}

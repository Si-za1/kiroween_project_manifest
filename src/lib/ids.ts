export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** FNV-1a 32-bit hash. Stable across runs, used for deterministic card draws and commit hashes. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seven hex characters, like an abbreviated git commit hash. */
export function shortHash(s: string): string {
  return hashString(s).toString(16).padStart(8, "0").slice(0, 7);
}

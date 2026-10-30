/** The generator's whole memory is one number. Keep it inside the match state. */
export type RngState = number;

/** Turn a text seed like "match-8f3a" into a starting state. */
export function seedFromString(seed: string): RngState {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h =
    Math.imul(h ^ (h >>> 16), 2246822507) ^
    Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Returns [number from 0 up to (not including) 1, new state]. */
export function nextFloat(state: RngState): [number, RngState] {
  const s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** True with the given percent chance (0 to 100). Used for resist rolls. */
export function chance(percent: number, state: RngState): [boolean, RngState] {
  const [value, next] = nextFloat(state);
  return [value < percent / 100, next];
}

/** Picks one item from a list. Used for Stall's random target. */
export function pick<T>(items: readonly T[], state: RngState): [T, RngState] {
  if (items.length === 0) throw new Error("pick: empty list");
  const [value, next] = nextFloat(state);
  return [items[Math.floor(value * items.length)], next];
}

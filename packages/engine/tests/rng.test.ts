import { describe, expect, test } from "bun:test";
import { chance, nextFloat, pick, seedFromString } from "../src/rng";

function draw(seed: string, n: number): number[] {
  let state = seedFromString(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const [v, next] = nextFloat(state);
    out.push(v);
    state = next;
  }
  return out;
}

describe("seeded rng", () => {
  test("same seed gives the same sequence", () => {
    expect(draw("match-1", 5)).toEqual(draw("match-1", 5));
  });

  test("different seeds give different sequences", () => {
    expect(draw("match-1", 5)).not.toEqual(draw("match-2", 5));
  });

  test("values stay between 0 and 1, and the state moves forward", () => {
    const values = draw("match-1", 200);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(new Set(values).size).toBeGreaterThan(190);
  });

  test("chance: 0% never, 100% always", () => {
    let state = seedFromString("x");
    for (let i = 0; i < 50; i++) {
      const [never, s1] = chance(0, state);
      const [always, s2] = chance(100, s1);
      expect(never).toBe(false);
      expect(always).toBe(true);
      state = s2;
    }
  });

  test("pick returns an item from the list, repeatably", () => {
    const items = ["a", "b", "c"];
    const [first] = pick(items, seedFromString("p"));
    const [again] = pick(items, seedFromString("p"));
    expect(items).toContain(first);
    expect(first).toBe(again);
  });
});

import { describe, expect, test } from "bun:test";
import { effectiveStats } from "../src/stats";

const luffy = { atk: 90, def: 55, sup: 30, heal: 15, lead: 80 };

describe("effectiveStats (luffy-eb)", () => {
  test("duelist: only ATK counts", () => {
    const s = effectiveStats(luffy, "duelist");
    expect(s.atk).toBe(90);
    expect(s.def).toBe(0);
    expect(s.lead).toBe(0);
  });

  test("tank: DEF counts fully, ATK at a quarter", () => {
    const s = effectiveStats(luffy, "tank");
    expect(s.def).toBe(55);
    expect(s.atk).toBeCloseTo(22.5);
  });

  test("support: his ATK is mostly wasted", () => {
    const s = effectiveStats(luffy, "support");
    expect(s.sup).toBe(30);
    expect(s.atk).toBeCloseTo(27);
    expect(s.heal).toBeCloseTo(4.5);
  });

  test("captain: LEAD counts fully, the rest at 60%", () => {
    const s = effectiveStats(luffy, "captain");
    expect(s.lead).toBe(80);
    expect(s.atk).toBeCloseTo(54);
    expect(s.def).toBeCloseTo(33);
  });

  test("level bonus scales everything", () => {
    const s = effectiveStats(luffy, "duelist", 30);
    expect(s.atk).toBeCloseTo(117);
  });
});

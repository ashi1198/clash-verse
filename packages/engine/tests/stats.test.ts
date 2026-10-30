import { describe, expect, test } from "bun:test";
import { rules } from "@verse/content";
import { effectiveStats, slotMultipliers, squadRoundHp } from "../src/stats";
import type { Slot, StatName } from "../src/types";

const luffy = { atk: 90, def: 55, sup: 30, heal: 15, lead: 80 };
const slots: Slot[] = ["captain", "duelist", "tank", "support", "healer"];
const statNames: StatName[] = ["atk", "def", "sup", "heal", "lead"];

describe("effectiveStats (luffy-eb)", () => {
  test("stats never shrink in any slot", () => {
    for (const slot of slots) {
      const s = effectiveStats(luffy, slot);
      for (const stat of statNames)
        expect(s[stat]).toBeGreaterThanOrEqual(luffy[stat]);
    }
  });

  test("duelist: ATK +30%, everything else unchanged", () => {
    const s = effectiveStats(luffy, "duelist");
    expect(s.atk).toBeCloseTo(117);
    expect(s.def).toBe(55);
    expect(s.lead).toBe(80);
  });

  test("tank: DEF +30%, ATK unchanged", () => {
    const s = effectiveStats(luffy, "tank");
    expect(s.def).toBeCloseTo(71.5);
    expect(s.atk).toBe(90);
  });

  test("support: SUP +30%", () => {
    expect(effectiveStats(luffy, "support").sup).toBeCloseTo(39);
  });

  test("healer: HEAL +30%", () => {
    expect(effectiveStats(luffy, "healer").heal).toBeCloseTo(19.5);
  });

  test("captain: LEAD +30%, other stats +10%", () => {
    const s = effectiveStats(luffy, "captain");
    expect(s.lead).toBeCloseTo(104);
    expect(s.atk).toBeCloseTo(99);
    expect(s.def).toBeCloseTo(60.5);
  });

  test("level bonus scales everything", () => {
    expect(effectiveStats(luffy, "duelist", 30).atk).toBeCloseTo(152.1);
  });
});

describe("slotMultipliers", () => {
  test("duelist strikes at full power but blocks poorly", () => {
    expect(slotMultipliers("duelist")).toEqual({
      strikeMult: 1,
      blockMult: 0.8,
    });
  });

  test("tank blocks well but strikes weakly", () => {
    expect(slotMultipliers("tank")).toEqual({
      strikeMult: 0.7,
      blockMult: 1.2,
    });
  });
});

describe("squadRoundHp", () => {
  test("base HP plus total DEF times hpPerDef", () => {
    const defs = [55, 70, 40, 30, 80]; // total 275
    expect(squadRoundHp(defs)).toBe(
      rules.match.baseRoundHp + 275 * rules.roles.hpPerDef,
    );
  });
});

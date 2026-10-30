import { describe, expect, test } from "bun:test";
import { rules } from "@verse/content";
import { resolveClash, type ClashSide } from "../src/clash";

const S = rules.match.damageScale;
// atk 50 means "x1 damage", def 0 means "no DEF reduction": easy maths
const plain = { atk: 50, def: 0, sup: 0, heal: 0, lead: 0 };
const side = (over: Partial<ClashSide> = {}): ClashSide => ({
  hp: 10000,
  focus: 2,
  stats: plain,
  move: "quickStrike",
  ...over,
});

describe("resolveClash", () => {
  test("quick vs quick: both take 60 x scale", () => {
    const r = resolveClash(side(), side());
    expect(r.a.damageTaken).toBe(60 * S);
    expect(r.b.damageTaken).toBe(60 * S);
    expect(r.a.hp).toBe(10000 - 60 * S);
  });

  test("guard blocks 30% and gains 1 focus", () => {
    const r = resolveClash(side(), side({ move: "guard" }));
    expect(r.b.damageTaken).toBe(Math.round(60 * S * 0.7));
    expect(r.b.focus).toBe(3);
    expect(r.a.damageTaken).toBe(0);
  });

  test("brace blocks 60% and costs 1 focus", () => {
    const r = resolveClash(side(), side({ move: "brace" }));
    expect(r.b.damageTaken).toBe(Math.round(60 * S * 0.4));
    expect(r.b.focus).toBe(1);
  });

  test("heavy strike costs 2 focus and hits harder", () => {
    const r = resolveClash(
      side({ move: "heavyStrike" }),
      side({ move: "guard" }),
    );
    expect(r.a.focus).toBe(0);
    expect(r.b.damageTaken).toBe(Math.round(130 * S * 0.7));
  });

  test("heavy strike without enough focus becomes a quick strike", () => {
    const r = resolveClash(
      side({ move: "heavyStrike", focus: 1 }),
      side({ move: "guard" }),
    );
    expect(r.a.move).toBe("quickStrike");
    expect(r.a.focus).toBe(1);
    expect(r.b.damageTaken).toBe(Math.round(60 * S * 0.7));
  });

  test("DEF reduces damage: def 100 halves it", () => {
    const tank = { ...plain, def: 100 };
    const r = resolveClash(side(), side({ stats: tank, move: "quickStrike" }));
    expect(r.b.damageTaken).toBe(Math.round((60 * S * 100) / 200));
  });

  test("HP never goes below 0", () => {
    const r = resolveClash(side(), side({ hp: 10 }));
    expect(r.b.hp).toBe(0);
  });

  test("focus is capped at the maximum", () => {
    const r = resolveClash(side({ move: "guard", focus: 6 }), side());
    expect(r.a.focus).toBe(rules.focus.max);
  });
});

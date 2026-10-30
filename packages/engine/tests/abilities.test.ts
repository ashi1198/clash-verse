import { describe, expect, test } from "bun:test";
import { abilities, rules } from "@verse/content";
import {
  applyStall,
  canUse,
  checkWhen,
  recordUse,
  startRound,
} from "../src/abilities";
import { seedFromString } from "../src/rng";
import type { Ability, Fighter, PlayerState, Resist } from "../src/types";

const pistol = abilities["gum-gum-pistol"] as unknown as Ability;
const baseStats = { atk: 50, def: 0, sup: 0, heal: 0, lead: 0 };

const fighter = (over: Partial<Fighter> = {}): Fighter => ({
  cardId: "luffy-eb",
  slot: "duelist",
  tags: ["strawhat"],
  stats: baseStats,
  abilityIds: [],
  stalled: false,
  used: false,
  ...over,
});
const player = (over: Partial<PlayerState> = {}): PlayerState => ({
  hp: 10000,
  maxHp: 10000,
  focus: 2,
  fighters: [fighter()],
  usage: { round: {}, match: {} },
  ...over,
});

describe("checkWhen", () => {
  test("no condition always passes", () => {
    expect(checkWhen(undefined, { fighter: fighter(), player: player() })).toBe(
      true,
    );
  });

  test("hpBelowPct compares current HP to max HP", () => {
    const f = fighter();
    expect(
      checkWhen(
        { hpBelowPct: 50 },
        { fighter: f, player: player({ hp: 4000 }) },
      ),
    ).toBe(true);
    expect(
      checkWhen(
        { hpBelowPct: 50 },
        { fighter: f, player: player({ hp: 6000 }) },
      ),
    ).toBe(false);
  });

  test("allyHasTag only counts teammates, not the card itself", () => {
    const luffy = fighter({ tags: ["strawhat"] });
    const nami = fighter({
      cardId: "nami-eb",
      slot: "support",
      tags: ["navigator"],
    });
    const p = player({ fighters: [luffy, nami] });
    expect(
      checkWhen({ allyHasTag: "navigator" }, { fighter: luffy, player: p }),
    ).toBe(true);
    expect(
      checkWhen({ allyHasTag: "strawhat" }, { fighter: luffy, player: p }),
    ).toBe(false);
  });

  test("losingClash needs the matching flag in the context", () => {
    const f = fighter();
    const p = player();
    expect(
      checkWhen(
        { losingClash: true },
        { fighter: f, player: p, losingClash: true },
      ),
    ).toBe(true);
    expect(checkWhen({ losingClash: true }, { fighter: f, player: p })).toBe(
      false,
    );
  });
});

describe("canUse", () => {
  test("gum-gum-pistol works for a duelist with enough focus", () => {
    expect(canUse(pistol, { fighter: fighter(), player: player() })).toEqual({
      ok: true,
    });
  });

  test("wrong slot: the ability is wasted", () => {
    const f = fighter({ slot: "support" });
    expect(
      canUse(pistol, { fighter: f, player: player({ fighters: [f] }) }),
    ).toEqual({
      ok: false,
      reason: "wrongSlot",
    });
  });

  test("not enough focus", () => {
    expect(
      canUse(pistol, { fighter: fighter(), player: player({ focus: 0 }) }),
    ).toEqual({
      ok: false,
      reason: "notEnoughFocus",
    });
  });

  test("a stalled card can't use abilities", () => {
    const f = fighter({ stalled: true });
    expect(
      canUse(pistol, { fighter: f, player: player({ fighters: [f] }) }),
    ).toEqual({
      ok: false,
      reason: "stalled",
    });
  });

  test("a failed when-condition blocks the ability", () => {
    const lastStand: Ability = {
      id: "last-stand",
      name: "Last Stand",
      slots: ["any"],
      trigger: "passive",
      when: { hpBelowPct: 50 },
    };
    expect(canUse(lastStand, { fighter: fighter(), player: player() })).toEqual(
      {
        ok: false,
        reason: "conditionNotMet",
      },
    );
    expect(
      canUse(lastStand, { fighter: fighter(), player: player({ hp: 3000 }) }),
    ).toEqual({ ok: true });
  });

  test("perRound limit: used once, blocked, then fine again next round", () => {
    const f = fighter();
    let p = player({ fighters: [f] });
    expect(canUse(pistol, { fighter: f, player: p }).ok).toBe(true);

    p = recordUse(p, pistol, f);
    expect(p.focus).toBe(1); // paid 1 focus
    expect(canUse(pistol, { fighter: f, player: p })).toEqual({
      ok: false,
      reason: "limitReached",
    });

    p = startRound(p);
    expect(p.focus).toBe(rules.focus.start);
    expect(canUse(pistol, { fighter: f, player: p }).ok).toBe(true);
  });

  test("perMatch limit survives new rounds", () => {
    const once: Ability = {
      id: "once",
      name: "Once",
      slots: ["any"],
      trigger: "onPlay",
      limit: { perMatch: 1, scope: "player" },
    };
    const f = fighter();
    let p = player({ fighters: [f] });
    p = recordUse(p, once, f);
    p = startRound(p);
    expect(canUse(once, { fighter: f, player: p })).toEqual({
      ok: false,
      reason: "limitReached",
    });
  });
});

describe("startRound", () => {
  test("resets hp, focus, round counters and card flags, keeps match counters", () => {
    const f = fighter({ stalled: true, used: true });
    const p = player({
      hp: 100,
      focus: 5,
      fighters: [f],
      usage: { round: { a: 1 }, match: { b: 2 } },
    });
    const r = startRound(p);
    expect(r.hp).toBe(10000);
    expect(r.focus).toBe(rules.focus.start);
    expect(r.fighters[0].stalled).toBe(false);
    expect(r.fighters[0].used).toBe(false);
    expect(r.usage.round).toEqual({});
    expect(r.usage.match).toEqual({ b: 2 });
  });
});

describe("applyStall", () => {
  const alwaysResist: Resist = {
    stat: "lead",
    divisor: 1,
    cap: 100,
    appliesTo: "captain",
  };
  const neverResist: Resist = {
    stat: "lead",
    divisor: 2,
    cap: 0,
    appliesTo: "captain",
  };

  const enemy = () =>
    player({
      fighters: [
        fighter({ cardId: "a-eb", slot: "captain" }),
        fighter({ cardId: "b-eb", slot: "tank" }),
        fighter({ cardId: "c-eb", slot: "healer" }),
      ],
    });

  test("picks a random unused card, repeatably for the same seed", () => {
    const one = applyStall(enemy(), neverResist, seedFromString("s"));
    const two = applyStall(enemy(), neverResist, seedFromString("s"));
    expect(one.targetCardId).toBe(two.targetCardId);
    expect(one.player.fighters.filter((f) => f.stalled).length).toBe(1);
  });

  test("does not modify the original player", () => {
    const original = enemy();
    applyStall(original, neverResist, seedFromString("s"));
    expect(original.fighters.every((f) => !f.stalled)).toBe(true);
  });

  test("skips cards that were already played", () => {
    const e = player({
      fighters: [
        fighter({ cardId: "a-eb", slot: "tank", used: true }),
        fighter({ cardId: "b-eb", slot: "healer" }),
      ],
    });
    expect(applyStall(e, neverResist, seedFromString("s")).targetCardId).toBe(
      "b-eb",
    );
  });

  test("a captain with a certain resist is never stalled", () => {
    const strongCaptain = fighter({
      cardId: "a-eb",
      slot: "captain",
      stats: { ...baseStats, lead: 100 },
    });
    const e = player({ fighters: [strongCaptain] });
    const r = applyStall(e, alwaysResist, seedFromString("s"));
    expect(r.resisted).toBe(true);
    expect(r.player.fighters[0].stalled).toBe(false);
  });

  test("the resist only applies to the captain: others are stalled anyway", () => {
    const e = player({ fighters: [fighter({ cardId: "b-eb", slot: "tank" })] });
    const r = applyStall(e, alwaysResist, seedFromString("s"));
    expect(r.resisted).toBe(false);
    expect(r.player.fighters[0].stalled).toBe(true);
  });

  test("a captain with a zero resist cap is always stalled", () => {
    const e = player({
      fighters: [fighter({ cardId: "a-eb", slot: "captain" })],
    });
    expect(
      applyStall(e, neverResist, seedFromString("s")).player.fighters[0]
        .stalled,
    ).toBe(true);
  });

  test("nobody eligible: nothing happens", () => {
    const e = player({ fighters: [fighter({ used: true })] });
    const r = applyStall(e, neverResist, seedFromString("s"));
    expect(r.targetCardId).toBeNull();
    expect(r.player).toBe(e);
  });
});

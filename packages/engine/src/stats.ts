import { rules } from "@verse/content";
import type { Slot, SlotRules, StatName, Stats } from "./types";

const STAT_NAMES: StatName[] = ["atk", "def", "sup", "heal", "lead"];
const SLOT_RULES = rules.roles.slots as unknown as Record<Slot, SlotRules>;

/**
 * A card's stats when placed in a slot.
 * Stats never shrink: the slot only adds a percent bonus to its own stat(s).
 * levelBonusPct comes from the card's level/stars later (0 for now).
 */
export function effectiveStats(
  base: Stats,
  slot: Slot,
  levelBonusPct = 0,
  slotRules: Record<Slot, SlotRules> = SLOT_RULES,
): Stats {
  const levelMult = 1 + levelBonusPct / 100;
  const out = { atk: 0, def: 0, sup: 0, heal: 0, lead: 0 } as Stats;
  for (const stat of STAT_NAMES) {
    const slotMult = 1 + (slotRules[slot].bonus[stat] ?? 0) / 100;
    out[stat] = base[stat] * slotMult * levelMult;
  }
  return out;
}

/** How good this slot is at striking and at blocking. */
export function slotMultipliers(
  slot: Slot,
  slotRules: Record<Slot, SlotRules> = SLOT_RULES,
): { strikeMult: number; blockMult: number } {
  const { strikeMult, blockMult } = slotRules[slot];
  return { strikeMult, blockMult };
}

/** Round HP for a squad: base HP plus a bit for every point of DEF on the five cards. */
export function squadRoundHp(defs: number[]): number {
  const totalDef = defs.reduce((sum, d) => sum + d, 0);
  return rules.match.baseRoundHp + totalDef * rules.roles.hpPerDef;
}

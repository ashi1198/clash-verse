import { rules } from "@verse/content";
import type { Slot, StatName, Stats } from "./types";

const STAT_NAMES: StatName[] = ["atk", "def", "sup", "heal", "lead"];

type SlotWeights = Record<Slot, Partial<Record<StatName, number>>>;

/**
 * The stats a card actually contributes when placed in a slot.
 * Stats the slot doesn't use count as 0, so a Tank in the Duelist slot
 * gets no DEF benefit, and Luffy as Support wastes most of his ATK.
 * levelBonusPct comes from the card's level/stars later (0 for now).
 */
export function effectiveStats(
  base: Stats,
  slot: Slot,
  levelBonusPct = 0,
  weights: SlotWeights = rules.roles.slots as SlotWeights,
): Stats {
  const slotWeights = weights[slot];
  const mult = 1 + levelBonusPct / 100;
  const out = { atk: 0, def: 0, sup: 0, heal: 0, lead: 0 } as Stats;
  for (const stat of STAT_NAMES) {
    out[stat] = base[stat] * (slotWeights[stat] ?? 0) * mult;
  }
  return out;
}

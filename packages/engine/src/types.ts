export type StatName = "atk" | "def" | "sup" | "heal" | "lead";
export type Slot = "captain" | "duelist" | "tank" | "support" | "healer";
export type Stats = Record<StatName, number>;

export interface SlotRules {
  bonus: Partial<Record<StatName, number>>; // percent bonus per stat
  strikeMult: number;
  blockMult: number;
}

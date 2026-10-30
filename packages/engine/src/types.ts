export type StatName = "atk" | "def" | "sup" | "heal" | "lead";
export type Slot = "captain" | "duelist" | "tank" | "support" | "healer";
export type Stats = Record<StatName, number>;
export type Tier = "C" | "B" | "A" | "S" | "GOD";

export interface SlotRules {
  bonus: Partial<Record<StatName, number>>; // percent bonus per stat
  strikeMult: number;
  blockMult: number;
}

export interface Limit {
  perRound?: number;
  perMatch?: number;
  scope?: "card" | "player";
}

export interface When {
  hpBelowPct?: number;
  hpAbovePct?: number;
  losingClash?: boolean;
  winningClash?: boolean;
  selfHasTag?: string;
  allyHasTag?: string;
  enemyHasTag?: string;
  focusAtLeast?: number;
}

export interface Resist {
  stat: StatName;
  divisor: number;
  cap: number;
  appliesTo?: "captain" | "any";
}

export interface Ability {
  id: string;
  name: string;
  description?: string;
  slots: (Slot | "any")[];
  trigger:
    | "onPlay"
    | "onRoundStart"
    | "onClashWin"
    | "onClashLose"
    | "onPhaseLock"
    | "passive";
  when?: When;
  cost?: { focus?: number };
  limit?: Limit;
  tags?: string[];
  target?: string;
  filter?: { tag?: string; notTag?: string; tier?: Tier };
  action?: string;
  stat?: StatName | "all";
  mode?: "flat" | "percent";
  value?: number;
  mult?: number;
  count?: number;
  duration?: "clash" | "round" | "match";
  reveals?: "card" | "move" | "hand";
  resist?: Resist;
}

/** One card on the field, already placed in a slot. */
export interface Fighter {
  cardId: string;
  slot: Slot;
  tags: string[];
  stats: Stats; // effective stats (from effectiveStats)
  abilityIds: string[];
  stalled: boolean; // abilities disabled until the card is played
  used: boolean; // already played this round
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  focus: number;
  fighters: Fighter[];
  usage: {
    round: Record<string, number>;
    match: Record<string, number>;
  };
}

import { rules } from "@verse/content";
import { chance, pick, type RngState } from "./rng";
import type { Ability, Fighter, PlayerState, Resist, When } from "./types";

export interface WhenContext {
  fighter: Fighter;
  player: PlayerState;
  losingClash?: boolean;
  winningClash?: boolean;
  enemyTags?: string[];
}

/** Does this ability's `when` condition hold right now? No condition = always true. */
export function checkWhen(when: When | undefined, ctx: WhenContext): boolean {
  if (!when) return true;
  const { fighter, player } = ctx;
  const hpPct = (player.hp / player.maxHp) * 100;

  if (when.hpBelowPct !== undefined && !(hpPct < when.hpBelowPct)) return false;
  if (when.hpAbovePct !== undefined && !(hpPct > when.hpAbovePct)) return false;
  if (when.losingClash !== undefined && when.losingClash !== !!ctx.losingClash)
    return false;
  if (
    when.winningClash !== undefined &&
    when.winningClash !== !!ctx.winningClash
  )
    return false;
  if (when.selfHasTag !== undefined && !fighter.tags.includes(when.selfHasTag))
    return false;
  if (
    when.allyHasTag !== undefined &&
    !player.fighters.some(
      (f) => f.cardId !== fighter.cardId && f.tags.includes(when.allyHasTag!),
    )
  )
    return false;
  if (
    when.enemyHasTag !== undefined &&
    !(ctx.enemyTags ?? []).includes(when.enemyHasTag)
  )
    return false;
  if (when.focusAtLeast !== undefined && player.focus < when.focusAtLeast)
    return false;
  return true;
}

/** Key used to count how often an ability was used (per card, or shared by the player). */
export function usageKey(ability: Ability, fighter: Fighter): string {
  return (ability.limit?.scope ?? "card") === "player"
    ? `player:${ability.id}`
    : `card:${fighter.cardId}:${ability.id}`;
}

export type UseCheck =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "stalled"
        | "wrongSlot"
        | "notEnoughFocus"
        | "limitReached"
        | "conditionNotMet";
    };

const no = (reason: Exclude<UseCheck, { ok: true }>["reason"]): UseCheck => ({
  ok: false,
  reason,
});

/** Can this fighter use this ability right now? Checks run in a fixed order. */
export function canUse(ability: Ability, ctx: WhenContext): UseCheck {
  const { fighter, player } = ctx;

  if (fighter.stalled) return no("stalled");
  if (!ability.slots.includes("any") && !ability.slots.includes(fighter.slot))
    return no("wrongSlot");
  if (player.focus < (ability.cost?.focus ?? 0)) return no("notEnoughFocus");

  const key = usageKey(ability, fighter);
  const { perRound, perMatch } = ability.limit ?? {};
  if (perRound !== undefined && (player.usage.round[key] ?? 0) >= perRound)
    return no("limitReached");
  if (perMatch !== undefined && (player.usage.match[key] ?? 0) >= perMatch)
    return no("limitReached");

  if (!checkWhen(ability.when, ctx)) return no("conditionNotMet");
  return { ok: true };
}

/** Pay the Focus and count the use. Returns a new player; the old one is untouched. */
export function recordUse(
  player: PlayerState,
  ability: Ability,
  fighter: Fighter,
): PlayerState {
  const key = usageKey(ability, fighter);
  return {
    ...player,
    focus: player.focus - (ability.cost?.focus ?? 0),
    usage: {
      round: {
        ...player.usage.round,
        [key]: (player.usage.round[key] ?? 0) + 1,
      },
      match: {
        ...player.usage.match,
        [key]: (player.usage.match[key] ?? 0) + 1,
      },
    },
  };
}

/** New round: full HP, starting Focus, per-round counters cleared, cards fresh. Match counters stay. */
export function startRound(player: PlayerState): PlayerState {
  return {
    ...player,
    hp: player.maxHp,
    focus: rules.focus.start,
    fighters: player.fighters.map((f) => ({
      ...f,
      stalled: false,
      used: false,
    })),
    usage: { round: {}, match: player.usage.match },
  };
}

export interface StallResult {
  player: PlayerState; // the enemy, with the target stalled (if it worked)
  targetCardId: string | null; // who was picked (null if nobody was eligible)
  resisted: boolean;
  rng: RngState;
}

/** Stall: pick a random unused enemy card and disable its abilities until it is played. */
export function applyStall(
  enemy: PlayerState,
  resist: Resist | undefined,
  rng: RngState,
): StallResult {
  const candidates = enemy.fighters.filter((f) => !f.used && !f.stalled);
  if (candidates.length === 0)
    return { player: enemy, targetCardId: null, resisted: false, rng };

  const [target, afterPick] = pick(candidates, rng);
  let state = afterPick;
  let resisted = false;

  const resistApplies =
    resist &&
    ((resist.appliesTo ?? "captain") === "any" || target.slot === "captain");
  if (resist && resistApplies) {
    const percent = Math.min(
      resist.cap,
      target.stats[resist.stat] / resist.divisor,
    );
    const [didResist, afterRoll] = chance(percent, state);
    resisted = didResist;
    state = afterRoll;
  }

  if (resisted)
    return {
      player: enemy,
      targetCardId: target.cardId,
      resisted: true,
      rng: state,
    };

  return {
    player: {
      ...enemy,
      fighters: enemy.fighters.map((f) =>
        f.cardId === target.cardId ? { ...f, stalled: true } : f,
      ),
    },
    targetCardId: target.cardId,
    resisted: false,
    rng: state,
  };
}

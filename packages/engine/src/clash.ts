import { rules } from "@verse/content";
import type { Stats } from "./types";

export type MoveName = keyof typeof rules.moves;

export interface ClashSide {
  hp: number;
  focus: number;
  stats: Stats; // effective stats from effectiveStats()
  move: MoveName;
  powerMult?: number; // Rally/Rattle will plug in here later (1 = normal)
}

export interface SideResult {
  move: MoveName; // the move actually played (may be downgraded)
  hp: number;
  focus: number;
  damageDealt: number;
  damageTaken: number;
}

export interface ClashResult {
  a: SideResult;
  b: SideResult;
}

/** If you can't pay for a move, you play its free version instead. */
export function legalMove(move: MoveName, focus: number): MoveName {
  if (focus >= rules.moves[move].focusCost) return move;
  if (move === "heavyStrike") return "quickStrike";
  if (move === "brace") return "guard";
  return move;
}

/** Damage a side sends out, before the other side defends. */
function outgoing(side: ClashSide, move: MoveName): number {
  const power = rules.moves[move].power;
  return (
    power *
    (side.stats.atk / 50) *
    (side.powerMult ?? 1) *
    rules.match.damageScale
  );
}

/** Damage that gets through the defender's block and DEF. */
function afterDefense(
  incoming: number,
  defender: ClashSide,
  defenderMove: MoveName,
): number {
  const blocked = incoming * (1 - rules.moves[defenderMove].block);
  return Math.round((blocked * 100) / (100 + defender.stats.def));
}

function nextFocus(focus: number, move: MoveName): number {
  const m = rules.moves[move];
  return Math.min(rules.focus.max, focus - m.focusCost + m.focusGain);
}

export function resolveClash(a: ClashSide, b: ClashSide): ClashResult {
  const moveA = legalMove(a.move, a.focus);
  const moveB = legalMove(b.move, b.focus);

  const toB = afterDefense(outgoing(a, moveA), b, moveB);
  const toA = afterDefense(outgoing(b, moveB), a, moveA);

  return {
    a: {
      move: moveA,
      hp: Math.max(0, a.hp - toA),
      focus: nextFocus(a.focus, moveA),
      damageDealt: toB,
      damageTaken: toA,
    },
    b: {
      move: moveB,
      hp: Math.max(0, b.hp - toB),
      focus: nextFocus(b.focus, moveB),
      damageDealt: toA,
      damageTaken: toB,
    },
  };
}

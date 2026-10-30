import tiers from "./core/tiers.json";
import roles from "./core/roles.json";
import focus from "./core/focus.json";
import tactics from "./core/tactics.json";
import onepieceAbilities from "./onepiece/abilities.json";

export const rules = {
  tiers: tiers.tiers,
  statMax: tiers.statMax,
  levelStatBonusMaxPct: tiers.levelStatBonusMaxPct,
  roles,
  focus: focus.focus,
  match: focus.match,
  moves: focus.moves,
  tactics: tactics.tactics,
};

/** Every ability by id. Add more universes' ability files here later. */
export const abilities: Record<string, unknown> = Object.fromEntries(
  onepieceAbilities.map((a) => [a.id, a]),
);

import tiers from "./core/tiers.json";
import roles from "./core/roles.json";
import focus from "./core/focus.json";
import tactics from "./core/tactics.json";

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

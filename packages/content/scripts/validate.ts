import Ajv2020 from "ajv/dist/2020";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const errors: string[] = [];
const rel = (p: string) => p.replace(ROOT, "").replace(/^[\\/]/, "");
const err = (file: string, msg: string) => errors.push(`${rel(file)}: ${msg}`);
const arr = (x: any): any[] =>
  x === undefined ? [] : Array.isArray(x) ? x : [x];

function readJson(path: string): any {
  if (!existsSync(path)) return undefined;
  const text = readFileSync(path, "utf8");
  if (text.trim() === "") return undefined; // empty files are skipped
  try {
    return JSON.parse(text);
  } catch (e) {
    err(path, `invalid JSON (${(e as Error).message})`);
    return undefined;
  }
}

// ---- load schemas -------------------------------------------------------
const ajv = new Ajv2020({ allErrors: true, strict: false });
const schemaDir = join(ROOT, "schemas");
for (const f of readdirSync(schemaDir)) {
  if (!f.endsWith(".schema.json")) continue;
  const schema = readJson(join(schemaDir, f));
  if (schema) ajv.addSchema(schema);
}
const getValidator = (name: string) => {
  const v = ajv.getSchema(
    `https://verseclash.local/schemas/${name}.schema.json`,
  );
  if (!v) throw new Error(`Schema not found: ${name}`);
  return v;
};

function checkSchema(kind: string, file: string, items: any[]): any[] {
  const v = getValidator(kind);
  const valid: any[] = [];
  items.forEach((item, i) => {
    if (v(item)) valid.push(item);
    else
      for (const e of v.errors ?? [])
        err(
          file,
          `[${i}] ${item?.id ?? "?"} ${e.instancePath || "/"} ${e.message}`,
        );
  });
  return valid;
}

function uniqueIds(file: string, items: any[], seen: Set<string>) {
  for (const it of items) {
    if (seen.has(it.id)) err(file, `duplicate id "${it.id}"`);
    seen.add(it.id);
  }
}

// ---- core rules ---------------------------------------------------------
const tiers = readJson(join(ROOT, "core", "tiers.json"))?.tiers;
if (!tiers) {
  console.error("core/tiers.json is missing or invalid");
  process.exit(1);
}

// ---- content per universe -----------------------------------------------
const reserved = new Set(["core", "schemas", "scripts", "node_modules"]);
const universes = readdirSync(ROOT).filter(
  (n) => statSync(join(ROOT, n)).isDirectory() && !reserved.has(n),
);

const counts = { abilities: 0, cards: 0, events: 0, arcs: 0, quizzes: 0 };

for (const universe of universes) {
  const uDir = join(ROOT, universe);

  // abilities
  const abFile = join(uDir, "abilities.json");
  const abilities = checkSchema("ability", abFile, arr(readJson(abFile)));
  const abilityIds = new Set<string>();
  uniqueIds(abFile, abilities, abilityIds);
  counts.abilities += abilities.length;

  const cardIds = new Set<string>();
  const eventIds = new Set<string>();
  const arcs: { file: string; arc: any }[] = [];

  // folders that contain cards/events: each arc folder, plus "special"
  const groups: { dir: string; folderArc: string }[] = [];
  const arcsDir = join(uDir, "arcs");
  if (existsSync(arcsDir))
    for (const a of readdirSync(arcsDir))
      if (statSync(join(arcsDir, a)).isDirectory())
        groups.push({ dir: join(arcsDir, a), folderArc: a });
  if (existsSync(join(uDir, "special")))
    groups.push({ dir: join(uDir, "special"), folderArc: "sp" });

  for (const { dir, folderArc } of groups) {
    // arc definition
    const arcFile = join(dir, "arc.json");
    for (const arc of checkSchema("arc", arcFile, arr(readJson(arcFile)))) {
      if (arc.id !== folderArc)
        err(arcFile, `arc id "${arc.id}" must match folder "${folderArc}"`);
      if (arc.universe !== universe)
        err(arcFile, `universe "${arc.universe}" must be "${universe}"`);
      arcs.push({ file: arcFile, arc });
      counts.arcs++;
    }

    // cards
    const cardFile = join(dir, "cards.json");
    const cards = checkSchema("card", cardFile, arr(readJson(cardFile)));
    uniqueIds(cardFile, cards, cardIds);
    for (const c of cards) {
      counts.cards++;
      const tier = tiers[c.tier];
      const total = Object.values(c.stats as Record<string, number>).reduce(
        (a, b) => a + b,
        0,
      );
      if (total !== tier.statBudget)
        err(
          cardFile,
          `${c.id}: stats total ${total}, but tier ${c.tier} needs exactly ${tier.statBudget}`,
        );
      if (c.stars > tier.maxStars)
        err(
          cardFile,
          `${c.id}: ${c.stars} stars, tier ${c.tier} allows max ${tier.maxStars}`,
        );
      if (c.abilities.length > tier.maxAbilities)
        err(
          cardFile,
          `${c.id}: ${c.abilities.length} abilities, tier ${c.tier} allows max ${tier.maxAbilities}`,
        );
      if (c.arc !== folderArc)
        err(
          cardFile,
          `${c.id}: arc "${c.arc}" but it lives in folder "${folderArc}"`,
        );
      if (!c.id.endsWith(`-${c.arc}`))
        err(cardFile, `${c.id}: id must end with "-${c.arc}"`);
      if (c.universe !== universe)
        err(
          cardFile,
          `${c.id}: universe "${c.universe}" must be "${universe}"`,
        );
      for (const a of c.abilities)
        if (!abilityIds.has(a))
          err(cardFile, `${c.id}: unknown ability "${a}"`);
    }

    // events
    const evFile = join(dir, "events.json");
    const events = checkSchema("event", evFile, arr(readJson(evFile)));
    uniqueIds(evFile, events, eventIds);
    counts.events += events.length;

    // quiz
    const quizFile = join(dir, "quiz.json");
    const quizzes = checkSchema("quiz", quizFile, arr(readJson(quizFile)));
    for (const q of quizzes)
      if (q.correctIndex >= q.answers.length)
        err(
          quizFile,
          `${q.id}: correctIndex ${q.correctIndex} is outside the ${q.answers.length} answers`,
        );
    counts.quizzes += quizzes.length;
  }

  // arcs must only reference things that exist
  for (const { file, arc } of arcs) {
    for (const id of arc.cardIds)
      if (!cardIds.has(id)) err(file, `unknown card "${id}"`);
    for (const id of arc.eventIds)
      if (!eventIds.has(id)) err(file, `unknown event "${id}"`);
  }

  // quests and wheels
  const questFile = join(uDir, "quests.json");
  for (const q of checkSchema("quest", questFile, arr(readJson(questFile))))
    if (!cardIds.has(q.unlocks) && !eventIds.has(q.unlocks))
      err(questFile, `${q.id}: unknown unlock "${q.unlocks}"`);

  const wheelFile = join(uDir, "wheels.json");
  for (const w of checkSchema("wheel", wheelFile, arr(readJson(wheelFile))))
    for (const s of w.slots)
      if (s.reward.startsWith("card:") && !cardIds.has(s.reward.slice(5)))
        err(wheelFile, `${w.id}: unknown card reward "${s.reward}"`);
}

// ---- report -------------------------------------------------------------
console.log(
  `Checked ${universes.length} universe(s): ${counts.abilities} abilities, ${counts.cards} cards, ` +
    `${counts.events} events, ${counts.arcs} arcs, ${counts.quizzes} quiz questions`,
);
if (errors.length) {
  console.error(`\n${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}
console.log("All content is valid.");

// Turns an Interlude datapack's Recipes.xml + item files into src/data/recipes.json.
// Run by hand:  node scripts/import-recipes.mjs <path to the datapack's dist/game/data folder>
// The datapack is only read, never changed. If anything looks wrong, nothing is written.
import fs from "node:fs";
import path from "node:path";

const dataDir = process.argv[2];
if (!dataDir) {
  console.error("Usage: node scripts/import-recipes.mjs <datapack dist/game/data folder>");
  process.exit(1);
}

const recipesXml = fs.readFileSync(path.join(dataDir, "Recipes.xml"), "utf8");
const itemsDir = path.join(dataDir, "stats", "items");

// 1) Item names: <item id="1864" type="EtcItem" name="Stem">
const names = new Map();
for (const file of fs.readdirSync(itemsDir).filter((f) => f.endsWith(".xml"))) {
  const xml = fs.readFileSync(path.join(itemsDir, file), "utf8");
  for (const m of xml.matchAll(/<item id="(\d+)" type="[^"]*" name="([^"]*)"/g)) {
    names.set(Number(m[1]), m[2]);
  }
}
if (names.size < 1000) throw new Error(`Only ${names.size} item names found: wrong folder?`);

// 2) Recipes
const header =
  /<item id="(\d+)" recipeId="(\d+)" name="[^"]*" craftLevel="(\d+)" type="(\w+)" successRate="(\d+)">([\s\S]*?)<\/item>/g;
const expected = (recipesXml.match(/<item id="\d+" recipeId=/g) ?? []).length;

const missing = new Set();
const nameOf = (id) => {
  const n = names.get(id);
  if (!n) missing.add(id);
  return n ?? `Item ${id}`;
};

const recipes = [];
for (const m of recipesXml.matchAll(header)) {
  const body = m[6];
  const production = body.match(/<production id="(\d+)" count="(\d+)"/);
  if (!production) throw new Error(`Recipe ${m[1]} has no product`);
  const mp = body.match(/<statUse name="MP" value="(\d+)"/);
  const ingredients = [...body.matchAll(/<ingredient id="(\d+)" count="(\d+)"/g)].map((i) => ({
    id: Number(i[1]),
    name: nameOf(Number(i[1])),
    count: Number(i[2]),
  }));
  recipes.push({
    id: Number(m[1]),
    recipeItemId: Number(m[2]),
    level: Number(m[3]),
    type: m[4], // "dwarven" or "common"
    successRate: Number(m[5]),
    mp: mp ? Number(mp[1]) : 0,
    product: { id: Number(production[1]), name: nameOf(Number(production[1])), count: Number(production[2]) },
    ingredients,
  });
}

if (recipes.length !== expected) {
  throw new Error(`Parsed ${recipes.length} recipes but the file has ${expected}: not writing anything`);
}

const out = path.join(process.cwd(), "src", "data", "recipes.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(recipes));
console.log(`Wrote ${recipes.length} recipes to ${out}`);
if (missing.size) console.warn(`Items without a name (${missing.size}):`, [...missing].slice(0, 20).join(", "));

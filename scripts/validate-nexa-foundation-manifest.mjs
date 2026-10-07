import fs from "node:fs";

const required = [
  "dataset_id",
  "version",
  "modality",
  "source",
  "license_or_permission",
  "provenance",
  "de_identified",
  "annotation_status",
  "intended_use",
  "split",
  "checksum",
  "created_at",
  "owner"
];

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-nexa-foundation-manifest.mjs <manifest.json>");
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const items = Array.isArray(data) ? data : data.items;
if (!Array.isArray(items) || items.length === 0) {
  throw new Error("Manifest must contain a non-empty array or an items array.");
}

for (const [i, item] of items.entries()) {
  for (const key of required) {
    if (item[key] === undefined || item[key] === null || item[key] === "") {
      throw new Error(`Manifest item ${i} is missing required field: ${key}`);
    }
  }
  if (item.de_identified !== true) {
    throw new Error(`Manifest item ${i} is not marked de_identified=true.`);
  }
}

console.log(`NEXA foundation manifest valid: ${items.length} item(s)`);

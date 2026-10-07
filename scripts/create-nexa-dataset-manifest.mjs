import fs from "node:fs";
import crypto from "node:crypto";

const [, , sourceFile, outputFile, ...pairs] = process.argv;
if (!sourceFile || !outputFile) {
  console.error("Usage: node scripts/create-nexa-dataset-manifest.mjs <approved-file> <manifest-output> key=value...");
  process.exit(2);
}

const args = Object.fromEntries(pairs.map((x) => {
  const i = x.indexOf("=");
  return i > 0 ? [x.slice(0, i), x.slice(i + 1)] : [x, ""];
}));

const required = ["dataset_id","version","modality","source","license_or_permission","provenance","annotation_status","intended_use","split","owner"];
for (const key of required) {
  if (!args[key]) throw new Error(`Missing required argument: ${key}`);
}
if (args.de_identified !== "true") {
  throw new Error("Refusing manifest creation: de_identified=true is required.");
}
if (!["train","validation","test","evaluation-only"].includes(args.split)) {
  throw new Error("Invalid split.");
}

const stat = fs.statSync(sourceFile);
if (!stat.isFile()) throw new Error("Source must be a regular file.");
const checksum = crypto.createHash("sha256").update(fs.readFileSync(sourceFile)).digest("hex");

const item = {
  dataset_id: args.dataset_id,
  version: args.version,
  modality: args.modality,
  source: args.source,
  license_or_permission: args.license_or_permission,
  provenance: args.provenance,
  de_identified: true,
  annotation_status: args.annotation_status,
  intended_use: args.intended_use,
  split: args.split,
  checksum,
  source_size_bytes: stat.size,
  created_at: new Date().toISOString(),
  owner: args.owner
};

fs.writeFileSync(outputFile, JSON.stringify({items:[item]}, null, 2) + "\n");
console.log(`NEXA manifest created for ${args.dataset_id}; sha256=${checksum}`);

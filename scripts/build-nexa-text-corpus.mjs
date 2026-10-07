import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [, , inputDir, outputDir] = process.argv;
if (!inputDir || !outputDir) {
  console.error("Usage: node scripts/build-nexa-text-corpus.mjs <approved-input-dir> <output-dir>");
  process.exit(2);
}

const allowed = new Set([".txt", ".md", ".json"]);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (allowed.has(path.extname(entry.name).toLowerCase())) files.push(p);
  }
}
walk(inputDir);
if (!files.length) throw new Error("No approved text files found.");

fs.mkdirSync(outputDir, {recursive:true});
const records = [];
for (const file of files.sort()) {
  const raw = fs.readFileSync(file, "utf8");
  if (/\b(name|patient.?id|mrn|medical.?record.?number|phone|email)\s*[:=]/i.test(raw)) {
    throw new Error(`Potential direct identifier detected in ${file}; refusing corpus build.`);
  }
  const text = raw.replace(/\r\n/g,"\n").replace(/[\t ]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
  if (!text) continue;
  const checksum = crypto.createHash("sha256").update(raw).digest("hex");
  records.push({
    document_id: crypto.createHash("sha256").update(file).digest("hex").slice(0,24),
    source_file: path.basename(file),
    source_sha256: checksum,
    text
  });
}
const output = path.join(outputDir,"corpus.jsonl");
fs.writeFileSync(output, records.map(x => JSON.stringify(x)).join("\n")+"\n");
console.log(`NEXA text corpus built: ${records.length} document(s) -> ${output}`);

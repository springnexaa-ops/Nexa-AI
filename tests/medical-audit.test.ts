import { strict as assert } from "node:assert";
import fs from "node:fs";
import { validateCitations } from "../src/medical-citation-validator";

const hits:any[] = [
  {
    chunkId:"source:v1:0",
    sourceId:"source",
    title:"Test Source",
    authority:"Test",
    url:"https://example.com",
    text:"Evidence",
    score:1,
    version:"v1",
    retrievedAt:"2026-09-17T00:00:00.000Z"
  }
];

const valid = validateCitations("The retrieved evidence supports this statement. [E1]", hits);
assert.equal(valid.valid, true);
assert.deepEqual(valid.ids, [1]);

const invalid = validateCitations("This cites evidence that does not exist. [E2]", hits);
assert.equal(invalid.valid, false);
assert.deepEqual(invalid.invalid, [2]);

const uncited = validateCitations(
  "This is a substantive paragraph that is intentionally left without an evidence citation so the audit gate can detect it.",
  hits
);
assert.equal(uncited.valid, true);
assert.equal(uncited.uncitedCount, 1);

console.log("medical audit citation tests: PASS");

const read = (path:string) => fs.readFileSync(path, "utf8");
const internal = read("src/medical-internal-knowledge.ts");
const evidenceStore = read("src/medical-live-evidence.ts");
const entry = read("src/entry.ts");

assert.match(internal, /getMedicalInternalContext/);
assert.match(internal, /private-runtime-knowledge-store/);
assert.doesNotMatch(internal, /chapter\\s*[:=]/i);
assert.doesNotMatch(internal, /primarySource\\s*[:=]/i);
assert.doesNotMatch(internal, /document structure/i);
assert.match(internal, /private source names/i);
assert.match(internal, /User-facing citations are allowed only for evidence explicitly supplied by the public evidence layer/i);

assert.equal(fs.existsSync("src/medical-first-gateway.ts"), false);
assert.doesNotMatch(entry, /medical-first-gateway/);
assert.match(entry, /queryPrivateMedicalKnowledge/);
assert.match(entry, /Private knowledge/);
assert.match(entry, /X-Robots-Tag/);

assert.match(evidenceStore, /private_chunks/);
assert.match(evidenceStore, /replacePrivateKnowledge/);
assert.match(evidenceStore, /searchPrivateKnowledge/);
assert.match(evidenceStore, /ingestPrivateMedicalKnowledge/);

assert.match(entry, /\/v1\/admin\/medical\/private-knowledge/);
assert.match(entry, /protectedAdmin/);
assert.match(entry, /ingestPrivateMedicalKnowledge/);

console.log("private medical knowledge boundary tests: PASS");

const openRegistry = read("src/medical-open-source-registry.ts");
assert.match(evidenceStore, /medicalKnowledgeInventory/);
assert.match(evidenceStore, /NEXA-Medical-Knowledge-Inventory/);
assert.match(evidenceStore, /registeredSourceFamilies/);
assert.match(evidenceStore, /neurophysiology/);
assert.match(openRegistry, /AANEM/);
assert.match(openRegistry, /IFCN/);
assert.match(openRegistry, /ILAE/);
assert.match(entry, /\/v1\/admin\/medical\/inventory/);

console.log("medical knowledge inventory tests: PASS");

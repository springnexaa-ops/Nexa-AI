import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path:string) => fs.readFileSync(path, "utf8");

const internal = read("src/medical-internal-knowledge.ts");
const gateway = read("src/medical-first-gateway.ts");
const evidence = read("src/medical-live-evidence.ts");
const entry = read("src/entry.ts");

assert.match(internal, /getMedicalInternalContext/);
assert.match(internal, /runtime-knowledge-store/);
assert.doesNotMatch(internal, /chapter\s*[:=]/i);
assert.doesNotMatch(internal, /primarySource\s*[:=]/i);
assert.doesNotMatch(internal, /document structure/i);

assert.match(gateway, /queryPrivateMedicalKnowledge/);
assert.match(gateway, /Private knowledge is never a user-facing source/);
assert.match(gateway, /x-robots-tag/);

assert.match(evidence, /private_chunks/);
assert.match(evidence, /replacePrivateKnowledge/);
assert.match(evidence, /searchPrivateKnowledge/);
assert.doesNotMatch(evidence, /SELECT .*private_chunks.*FROM sources/i);

assert.match(entry, /\/v1\/admin\/medical\/private-knowledge/);
assert.match(entry, /protectedAdmin/);
assert.match(entry, /ingestPrivateMedicalKnowledge/);

console.log("Private medical knowledge boundary checks passed.");

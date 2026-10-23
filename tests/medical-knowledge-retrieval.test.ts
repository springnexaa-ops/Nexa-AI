import assert from "node:assert/strict";
import { rankMedicalKnowledge, scoreMedicalKnowledgeLexically, tokenizeMedicalQuery } from "../src/medical-knowledge-retrieval";

assert.deepEqual(tokenizeMedicalQuery("EEG and EMG findings"), ["eeg", "emg", "findings"]);
assert.ok(scoreMedicalKnowledgeLexically("EEG seizure pattern", "EEG may show seizure patterns") > 0);
assert.equal(scoreMedicalKnowledgeLexically("VEP BERA", "median nerve conduction and EMG"), 0);

const ranked = rankMedicalKnowledge("needle EMG MUAP", [
  { id: "a", text: "EEG recording montage and seizure patterns" },
  { id: "b", text: "Needle EMG assesses MUAP morphology and recruitment" },
  { id: "c", text: "Motor and sensory nerve conduction studies" }
], 2);
assert.equal(ranked[0]?.id, "b");
assert.equal(ranked.length, 2);
assert.ok(ranked[0].score > ranked[1].score);

console.log("Nexa lexical medical knowledge retrieval tests passed");

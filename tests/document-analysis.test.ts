import assert from "node:assert/strict";
import { analyzeFile } from "../src/file-reader";

const originalRun = (globalThis as any).crypto;

function pdfFile(text = "NERVE CONDUCTION STUDY MNC STUDIES CMAP SNAP") {
  const body = new Uint8Array(new TextEncoder().encode(text));
  return new File([body], "report.pdf", { type: "application/pdf" });
}

function requestFor(file: File) {
  const form = new FormData();
  form.set("file", file);
  form.set("question", "Review this report.");
  return new Request("https://nexa.test/v1/files/analyze", { method: "POST", body: form });
}

const sha = async (_bytes: Uint8Array) => "test-hash";

try {
  const moduleText = await import("../src/file-reader");
  void originalRun;
  assert.equal(typeof analyzeFile, "function");
  assert.equal(typeof moduleText.analyzeFile, "function");

  const fallbackEnv = {
    AI: {
      toMarkdown: async () => { throw new Error("provider unavailable"); },
      run: async () => ({ response: "NCS review complete." }),
    },
  };

  // A text-bearing fallback PDF should still reach modality classification
  // even when Workers AI conversion is unavailable.
  const response = await analyzeFile(requestFor(pdfFile()), fallbackEnv);
  assert.equal(response.status, 200);
  const body = await response.json() as any;
  assert.equal(body.ok, true);
  assert.equal(body.documentType, "NCS Report");
  assert.equal(body.extraction.source, "raw-pdf-fallback");
  assert.equal(body.analysis, "NCS review complete.");

  // A PDF with no extractable literal strings must expose a deterministic
  // extraction diagnostic rather than a generic opaque failure.
  const emptyEnv = {
    AI: {
      toMarkdown: async () => { throw new Error("conversion backend unavailable"); },
    },
  };
  const failed = await analyzeFile(requestFor(new File([new Uint8Array([37,80,68,70])], "scan.pdf", {type:"application/pdf"})), emptyEnv);
  assert.equal(failed.status, 502);
  const failedBody = await failed.json() as any;
  assert.equal(failedBody.ok, false);
  assert.equal(failedBody.diagnostics.stage, "pdf-extraction");
  assert.match(String(failedBody.detail), /NEXA PDF extraction failed/i);

  console.log("document-analysis tests: PASS");
} finally {
  void sha;
}

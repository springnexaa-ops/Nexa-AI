import { queryPrivateMedicalKnowledge } from "./medical-live-evidence";
import { getMedicalInternalContext } from "./medical-internal-knowledge";

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_TEXT = 140_000;

function normalizeDocumentText(text: string) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT);
}

function classificationText(text: string) {
  return normalizeDocumentText(text).replace(/\s+/g, " ").toUpperCase();
}

async function sha256Bytes(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function extractRawPdfText(file: File) {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const raw = new TextDecoder("latin1").decode(bytes);
    const strings: string[] = [];
    // PDF literal strings are only a fallback classifier signal. Clinical analysis
    // always uses the complete toMarkdown result.
    const re = /\\((?:\\\\|\\\(|\\\)|[^)]){2,500})\\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) && strings.length < 800) {
      strings.push(m[1].replace(/\\([\\()])/g, "$1").replace(/\\[nrt]/g, " "));
    }
    return normalizeDocumentText(strings.join("\n"));
  } catch {
    return "";
  }
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function normalizeType(text: string) {
  const upper = classificationText(text);

  // Deterministic, high-signal modality anchors. These are evaluated before
  // generic abbreviations so an NCS table cannot be overridden by an incidental
  // "EEG" mention in history/referral text.
  const strong: Array<[string, RegExp[]]> = [
    ["NCS Report", [
      /MNC\s+STUDIES/, /SNC\s+STUDIES/, /F[- ]WAVE\s+STUDIES/,
      /NERVE\s+CONDUCTION\s+STUDY/, /NERVE\s+CONDUCTION/,
      /STIM\s+SITE.*LAT.*AMP.*(?:CV|VELOCITY)/,
      /CMAP.*SNAP/, /MOTOR\s+NERVE.*SENSORY\s+NERVE/
    ]],
    ["EMG Report", [
      /NEEDLE\s+EMG/, /ELECTROMYOGRAPHY/, /MOTOR\s+UNIT\s+POTENTIAL/,
      /MUAP/, /RECRUITMENT/, /FIBRILLATION\s+POTENTIAL/, /POSITIVE\s+SHARP\s+WAVE/
    ]],
    ["EEG Report", [
      /ELECTROENCEPHALOGRAM/, /ELECTROENCEPHALOGRAPHY/, /EEG\s+RECORDING/,
      /POSTERIOR\s+DOMINANT\s+RHYTHM/, /PDR/, /EPILEPTIFORM\s+ACTIVITY/,
      /SPIKE[- ]AND[- ]WAVE/, /MONTAGE.*EEG/
    ]],
    ["VEP Report", [/VISUAL\s+EVOKED\s+POTENTIAL/, /\bVEP\b/, /P100\s+LATENCY/]],
    ["BAER/BERA Report", [/BRAINSTEM\s+AUDITORY\s+EVOKED/, /\bBAER\b/, /\bBERA\b/]],
    ["RNS Report", [/REPETITIVE\s+NERVE\s+STIMULATION/, /\bRNS\b/, /DECREMENT.*CMAP/, /INCREMENT.*CMAP/]]
  ];

  for (const [type, patterns] of strong) {
    if (patterns.some(pattern => pattern.test(upper))) return type;
  }

  const scored: Array<[string, RegExp[]]> = [
    ["NCS Report", [/\bNCS\b/, /\bNCV\b/, /CMAP/, /SNAP/, /F[- ]?WAVE/, /H[- ]?REFLEX/, /CONDUCTION\s+VELOCITY/, /DISTAL\s+LATENCY/]],
    ["EMG Report", [/\bEMG\b/, /ELECTROMYOGRAPH/, /MOTOR\s+UNIT/]],
    ["EEG Report", [/\bEEG\b/, /ELECTROENCEPHALOGRAPH/, /EPILEPTIFORM/]],
    ["VEP Report", [/\bVEP\b/, /VISUAL\s+EVOKED/]],
    ["BAER/BERA Report", [/\bBAER\b/, /\bBERA\b/, /BRAINSTEM\s+AUDITORY/]],
    ["RNS Report", [/\bRNS\b/, /REPETITIVE\s+NERVE\s+STIMULATION/]]
  ];
  const ranked = scored.map(([type, patterns]) => ({
    type,
    score: patterns.reduce((n, p) => n + (p.test(upper) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);
  if (ranked[0]?.score >= 2) return ranked[0].type;

  if (/DIAGNOSIS|IMPRESSION|CLINICAL|PATIENT|REPORT|LABORATORY|RADIOLOGY|ULTRASOUND|MRI|CT\s+SCAN/.test(upper)) return "Other Medical Report";
  return "Unknown Document";
}

async function convertDocument(env: any, file: File) {
  if (!env.AI?.toMarkdown) throw new Error("NEXA document conversion is not configured.");
  const result: any = await env.AI.toMarkdown(
    { name: file.name || "uploaded-document.pdf", blob: new Blob([await file.arrayBuffer()], { type: file.type || "application/pdf" }) },
    { conversionOptions: { output: { format: "markdown" }, image: { descriptionLanguage: "en" }, pdf: { metadata: true } } },
  );
  const item = Array.isArray(result) ? result[0] : result;
  if (!item || item.format === "error") throw new Error(item?.error || "NEXA document conversion failed.");
  return normalizeDocumentText(String(item.data || ""));
}

function medicalPrompt(documentType: string, question: string, documentText: string, evidence: string) {
  const structures: Record<string, string> = {
    "NCS Report": `Return an NCS report-data review. Extract only values explicitly present in the uploaded report:
- NERVES STUDIED
- MOTOR NCS: nerve, side, latency, amplitude, conduction velocity, F-wave/H-reflex when present
- SENSORY NCS: nerve, side, latency, amplitude, conduction velocity when present
- ABNORMAL VALUES / SIDE-TO-SIDE DIFFERENCES
- IMPRESSION
- LIMITATIONS
Preserve the report's units, sides and exact values. If a field is absent, say "Not stated in the uploaded report", not "normal" and not "not found".`,
    "EMG Report": `Return an EMG report-data review:
- MUSCLES / NERVES / ROOTS EXAMINED
- INSERTIONAL ACTIVITY
- SPONTANEOUS ACTIVITY
- MOTOR UNIT MORPHOLOGY
- RECRUITMENT
- INTERFERENCE PATTERN
- ABNORMAL FINDINGS
- IMPRESSION
- LIMITATIONS
Only report findings explicitly present in the uploaded report.`,
    "EEG Report": `Return an EEG report/graph review:
- EEG QUALITY
- BACKGROUND
- ABNORMAL SLOWING
- EPILEPTIFORM ACTIVITY
- EVENTS / SEIZURES
- ACTIVATION / SLEEP
- PAGE / EPOCH OBSERVATIONS
- IMPRESSION
- LIMITATIONS
Only report waveform features actually visible/described in the uploaded file.`,
    "VEP Report": `Return VEP report data:
- EYE / SIDE
- P100/N75/P100 LATENCIES when stated
- AMPLITUDES when stated
- INTER-EYE DIFFERENCE when stated
- ABNORMAL FINDINGS
- IMPRESSION
- LIMITATIONS`,
    "BAER/BERA Report": `Return BAER/BERA report data:
- SIDE / EAR
- WAVE I, III, V LATENCIES when stated
- INTERPEAK LATENCIES when stated
- AMPLITUDES when stated
- ABNORMAL FINDINGS
- IMPRESSION
- LIMITATIONS`,
    "RNS Report": `Return RNS report data:
- MUSCLE / NERVE / SIDE
- STIMULATION FREQUENCY AND TRAIN
- BASELINE CMAP
- DECREMENT / INCREMENT VALUES
- POST-EXERCISE FINDINGS
- ABNORMAL FINDINGS
- IMPRESSION
- LIMITATIONS`
  };

  const structure = structures[documentType] || "Answer using the exact data and findings contained in the uploaded document, organized around the user's question.";

  return `You are Nexa AI Medical performing document-grounded extraction and explanation.

USER QUESTION:
${question}

UPLOADED DOCUMENT TYPE:
${documentType}

REQUIRED RESPONSE STRUCTURE:
${structure}

UPLOADED DOCUMENT — PRIMARY AND AUTHORITATIVE SOURCE:
<<<DOCUMENT_START>>>
${documentText || "[No reliable text was extracted. State that the uploaded document could not be reliably read.]"}
<<<DOCUMENT_END>>>

NEXA MEDICAL KNOWLEDGE — SECONDARY CLINICAL CONTEXT ONLY:
${evidence || getMedicalInternalContext([])}

STRICT DOCUMENT-GROUNDING RULES:
1. Every patient-specific value, nerve, side, latency, amplitude, velocity, waveform finding, impression and conclusion MUST come from the uploaded document.
2. Never fill a missing value from NEXA medical knowledge.
3. Never invent a normal result because a result is absent.
4. Never output other modalities as "not found". Only discuss the modality detected in the uploaded document.
5. NEXA medical knowledge may explain terminology or clinical significance, but it must never create a patient-specific finding.
6. Preserve exact numerical values and units from the uploaded report.
7. If the PDF extraction is incomplete or does not expose a graph/value, explicitly say "Not reliably assessable from the uploaded PDF" rather than guessing.
8. If the uploaded file is NCS, answer with NCS report data. If it is EEG, answer with EEG data/graph observations. Apply the same rule to EMG, VEP, BAER/BERA and RNS.
9. Do not substitute a generic medical explanation for the uploaded report.
10. Do not disclose private corpus text or retrieval metadata.
11. Final clinical interpretation requires qualified professional review.
`;
}

async function answerWithNexaMedical(env: any, question: string, documentType: string, documentText: string) {
  const evidenceQuery = [
    "document type: " + documentType,
    "user question: " + (question || "review the uploaded report"),
    "clinical terms from uploaded document: " + classificationText(documentText).slice(0, 6000)
  ].join("\n");
  const hits = await queryPrivateMedicalKnowledge(env, evidenceQuery, 6).catch(() => []);
  const evidence = hits.length
    ? hits.map((h: any, i: number) => "[P" + (i + 1) + "] " + h.text).join("\n\n")
    : getMedicalInternalContext([]);
  const prompt = medicalPrompt(documentType, question, documentText, evidence);
  const model = "@" + "cf/zai-org/glm-4.7-flash";
  if (!env.AI?.run) throw new Error("NEXA Medical inference is not configured.");
  const result: any = await env.AI.run(model, {
    messages: [
      { role: "system", content: "You are Nexa AI Medical. Use only supplied document facts and NEXA medical evidence." },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 3000,
  });
  const answer = String(result?.response || result?.choices?.[0]?.message?.content || "").trim();
  if (!answer) throw new Error("NEXA Medical returned an empty document analysis.");
  return { answer, model };
}

export async function analyzeFile(request: Request, env: any): Promise<Response> {
  try {
    if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BYTES) return json(413, { ok: false, error: "File exceeds the 20 MB limit." });

    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return json(400, { ok: false, error: "Please upload a PDF or image." });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: "File exceeds the 20 MB limit." });

    const name = value.name || "uploaded-file";
    const mime = value.type || (name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");
    const isPdf = mime === "application/pdf" || name.toLowerCase().endsWith(".pdf");
    const isImage = mime.startsWith("image/");
    if (!isPdf && !isImage) return json(415, { ok: false, error: "Nexa Structured Reader accepts PDF or image files." });

    const question = String(form.get("question") || "").trim().slice(0, 4000) || "Review the uploaded file itself and explain exactly what this document or graph shows.";
    const documentText = await convertDocument(env, value);
    const rawPdfText = isPdf ? await extractRawPdfText(value) : "";
    const classificationSource = [documentText, rawPdfText].filter(Boolean).join("\n");
    const documentType = normalizeType(classificationSource);

    // Never let the generative model choose a medical modality when deterministic
    // extraction did not identify one. That was the source of the false EEG result.
    if (documentType === "Unknown Document") {
      return json(422, {
        ok: false,
        error: "Nexa could not reliably identify the uploaded document type from the file itself.",
        documentType: "Unknown Document",
        instruction: "Do not guess the modality. Re-upload a clearer PDF or image.",
        file: { name, size: value.size, mimeType: isPdf ? "application/pdf" : mime },
      });
    }

    const fileBytes = new Uint8Array(await value.arrayBuffer());
    const documentHash = await sha256Bytes(fileBytes);
    const result = await answerWithNexaMedical(
      env,
      question,
      documentType,
      documentText
    );
    return json(200, {
      ok: true,
      documentType,
      documentHash,
      extraction: {
        engine: "Cloudflare Workers AI Markdown Conversion",
        characters: documentText.length,
        classification: "deterministic-document-content",
        source: documentText.length ? "converted-document" : rawPdfText.length ? "raw-pdf-fallback" : "none"
      },
      analysis: result.answer,
      file: { name, size: value.size, mimeType: isPdf ? "application/pdf" : mime },
      provider: "nexa-medical-resource",
      model: result.model,
      engine: "NEXA Medical Document QA",
      disclaimer: "Assistive medical document review only. Final clinical interpretation requires qualified professional review.",
    });
  } catch (error) {
    return json(502, {
      ok: false,
      error: "NEXA document analysis failed.",
      detail: error instanceof Error ? error.message : "Unknown document processing error",
    });
  }
}

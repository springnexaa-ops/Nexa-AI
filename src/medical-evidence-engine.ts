import { getMedicalBookContext } from "./medical-book-knowledge";
import { NEXA_MEDICAL_SOURCES, getMedicalSourceContext, type MedicalSource } from "./medical-open-source-registry";

export type EvidenceRecord = {
  id: string;
  title: string;
  authority: string;
  type: MedicalSource["type"] | "book-context";
  url?: string;
  access: MedicalSource["access"] | "local";
  ingestion: MedicalSource["ingestion"] | "local-reference";
  relevance: number;
  provenance: { sourceId: string; retrievedAt: string; version: string };
  use: "retrieval-context" | "metadata-link-only" | "blocked-ingestion";
};

export type MedicalEvidencePack = {
  engine: "NEXA-Medical-Evidence-RAG";
  version: string;
  query: string;
  generatedAt: string;
  intent: string[];
  evidence: EvidenceRecord[];
  context: string;
  safety: string[];
};

const VERSION = "1.0.0";
const NOW = () => new Date().toISOString();

const INTENT_RULES: Array<[string, string[]]> = [
  ["neurophysiology", ["ncs", "nerve conduction", "emg", "electromyography", "eeg", "evoked potential", "bera", "baer", "rns", "repetitive nerve", "neuromuscular"]],
  ["cardiology", ["ecg", "ekg", "cardiac", "arrhythmia", "heart failure", "troponin", "holter"]],
  ["radiology", ["x-ray", "xray", "ct", "mri", "ultrasound", "dicom", "radiology", "imaging"]],
  ["laboratory", ["cbc", "hemoglobin", "creatinine", "liver function", "thyroid", "lab result", "laboratory", "blood test"]],
  ["pharmacology", ["medicine", "medication", "drug", "dose", "adverse effect", "interaction", "rxnorm"]],
  ["genomics", ["gene", "genetic", "variant", "mutation", "genome", "clinvar", "genbank", "hereditary"]],
  ["infectious-disease", ["infection", "antibiotic", "virus", "bacteria", "covid", "sepsis", "outbreak"]],
  ["oncology", ["cancer", "tumor", "oncology", "chemotherapy", "radiotherapy"]],
  ["public-health", ["screening", "vaccination", "epidemiology", "public health", "prevention"]],
  ["clinical-trials", ["clinical trial", "trial", "randomized", "study protocol", "clinicaltrials"]],
  ["interoperability", ["fhir", "hl7", "abha", "ehr", "emr", "health record", "loinc", "icd"]],
  ["medical-ai", ["medical ai", "clinical ai", "ai model", "machine learning", "llm", "medical assistant"]],
  ["regulatory", ["cdsco", "mdd", "medical device", "sa md", "software as medical device", "licence", "license", "regulatory"]]
];

function detectIntent(query: string): string[] {
  const q = query.toLowerCase();
  const intents = INTENT_RULES.filter(([, terms]) => terms.some(t => q.includes(t))).map(([name]) => name);
  return intents.length ? [...new Set(intents)] : ["general-medicine"];
}

function scoreSource(source: MedicalSource, query: string, intents: string[]): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const domain of source.domains) {
    const d = domain.toLowerCase();
    if (q.includes(d)) score += 8;
    if (intents.some(i => d.includes(i) || i.includes(d))) score += 4;
  }
  if (["ICMR_AI", "CDSCO_MDR", "ABDM", "WHO", "NLM_PMC"].includes(source.id)) score += 1;
  if (source.type === "regulatory" && intents.includes("regulatory")) score += 6;
  if (source.type === "guideline" && (intents.includes("general-medicine") || intents.includes("public-health"))) score += 3;
  return score;
}

function evidenceUse(source: MedicalSource): EvidenceRecord["use"] {
  if (source.ingestion === "do-not-ingest-without-license" || source.ingestion === "metadata-and-link") return source.ingestion === "metadata-and-link" ? "metadata-link-only" : "blocked-ingestion";
  return "retrieval-context";
}

function toEvidence(source: MedicalSource, relevance: number, now: string): EvidenceRecord {
  return {
    id: source.id,
    title: source.name,
    authority: source.authority,
    type: source.type,
    url: source.url,
    access: source.access,
    ingestion: source.ingestion,
    relevance,
    provenance: { sourceId: source.id, retrievedAt: now, version: "source-version-not-embedded" },
    use: evidenceUse(source)
  };
}

export function buildMedicalEvidencePack(query: string, maxSources = 12): MedicalEvidencePack {
  const clean = String(query || "").trim().slice(0, 4000);
  const generatedAt = NOW();
  const intent = detectIntent(clean);
  const ranked = NEXA_MEDICAL_SOURCES
    .map(source => ({ source, score: scoreSource(source, clean, intent) }))
    .sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id));

  const selected = ranked.filter(x => x.score > 0).slice(0, Math.max(1, Math.min(maxSources, 20)));
  const fallback = ["ICMR_AI", "CDSCO_MDR", "WHO", "NLM_PMC", "NLM_MEDLINEPLUS", "ABDM"]
    .map(id => ranked.find(x => x.source.id === id))
    .filter(Boolean) as Array<{ source: MedicalSource; score: number }>;
  const finalSources = selected.length >= 4 ? selected : [...selected, ...fallback].filter((x, i, arr) => arr.findIndex(y => y.source.id === x.source.id) === i).slice(0, maxSources);

  const evidence = finalSources.map(x => toEvidence(x.source, x.score, generatedAt));
  const context = [
    getMedicalSourceContext(clean),
    "\nNEXA RAG RANKING:\n" + evidence.map((e, i) => `${i + 1}. ${e.title} [${e.id}] relevance=${e.relevance} use=${e.use} url=${e.url || "local"}`).join("\n"),
    "\nNEXA LICENSE GATE: Never bulk-ingest a source merely because it is searchable or publicly accessible. Respect source-specific copyright, data-use, credentialing and redistribution terms. Metadata/link retrieval is permitted where the registry says metadata-and-link; full-text/data ingestion requires an explicit compatible licence or terms.",
    "\nNEXA CLINICAL EVIDENCE RULE: Do not convert source presence into a diagnosis. For patient-specific material, quote/derive only from supplied observations and retrieved evidence; separate evidence, inference, uncertainty and clinician-review points.",
    "\nNEXA REGULATORY RULE: Evidence quality does not equal regulatory approval. Intended use, risk classification, clinical validation, QMS, cybersecurity, human factors, privacy and applicable Indian submissions remain separate workstreams."
  ].join("\n");

  return {
    engine: "NEXA-Medical-Evidence-RAG",
    version: VERSION,
    query: clean,
    generatedAt,
    intent,
    evidence,
    context,
    safety: [
      "Source provenance is mandatory.",
      "Current version/date must be retained by the production ingestion pipeline.",
      "Restricted or licence-required resources must not be redistributed as if open data.",
      "Patient-specific outputs require qualified clinician review for clinical decisions."
    ]
  };
}

export function getMedicalEvidenceContext(query: string): string {
  const pack = buildMedicalEvidencePack(query);
  const book = getMedicalBookContext(query);
  return [
    `NEXA MEDICAL EVIDENCE RAG v${pack.version}`,
    `Intent: ${pack.intent.join(", ")}`,
    pack.context,
    "\nLOCAL STRUCTURED REFERENCE:\n" + book
  ].join("\n\n");
}

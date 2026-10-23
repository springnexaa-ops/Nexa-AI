import { buildMedicalEvidencePack, type MedicalEvidencePack } from "./medical-evidence-engine";
import type { EvidenceItem } from "./sequential-clinical-orchestrator";

/**
 * Adapts Nexa's existing evidence registry/RAG pack to the sequential workflow.
 * This does not claim that source metadata means full-text content was read.
 */
export type SequentialEvidenceResult = {
  query: string;
  evidence: EvidenceItem[];
  context: string;
  safety: string[];
  engine: MedicalEvidencePack["engine"];
  version: string;
  generatedAt: string;
};

export function retrieveSequentialEvidence(
  query: string,
  maxSources = 8,
): SequentialEvidenceResult {
  const pack = buildMedicalEvidencePack(query, maxSources);

  const evidence: EvidenceItem[] = pack.evidence.map((record) => {
    const limitations: string[] = [];
    if (record.use === "metadata-link-only") {
      limitations.push("Source metadata/link only; do not represent this as full-text review.");
    }
    if (record.use === "blocked-ingestion") {
      limitations.push("Full-text ingestion is blocked pending licence/terms verification.");
    }
    if (record.provenance.version === "source-version-not-embedded") {
      limitations.push("Source version was not embedded in the registry record; verify current version before clinical use.");
    }

    return {
      id: record.id,
      title: record.title,
      source: record.authority,
      ...(record.url ? { url: record.url } : {}),
      retrievedAt: record.provenance.retrievedAt,
      supports: [],
      limitations,
    };
  });

  return {
    query: pack.query,
    evidence,
    context: pack.context,
    safety: pack.safety,
    engine: pack.engine,
    version: pack.version,
    generatedAt: pack.generatedAt,
  };
}

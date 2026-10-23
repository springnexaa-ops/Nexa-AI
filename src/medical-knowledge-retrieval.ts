/**
 * Provider-independent lexical retrieval for Nexa's private medical corpus.
 * This baseline deliberately does not require hosted embeddings or an AI API.
 */
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "are", "was", "were",
  "into", "about", "what", "when", "where", "how", "why", "your", "have",
  "has", "had", "can", "could", "should", "would", "will", "not", "but",
  "use", "using", "patient", "please", "show", "tell", "give"
]);

export function tokenizeMedicalQuery(value: string): string[] {
  return value.toLowerCase().normalize("NFKC")
    .match(/[a-z0-9]+(?:[.+/-][a-z0-9]+)*/g)
    ?.filter(token => token.length > 1 && !STOP_WORDS.has(token)) ?? [];
}

/**
 * Simple normalized term-overlap score with a small exact-phrase boost.
 * This is intentionally transparent and deterministic; it is not semantic search.
 */
export function scoreMedicalKnowledgeLexically(query: string, content: string): number {
  const queryTokens = tokenizeMedicalQuery(query);
  if (!queryTokens.length || !content) return 0;
  const contentTokens = new Set(tokenizeMedicalQuery(content));
  let score = 0;
  for (const token of queryTokens) if (contentTokens.has(token)) score += 1;
  const phrase = query.trim().toLowerCase();
  if (phrase.length > 4 && content.toLowerCase().includes(phrase)) score += 3;
  return score / Math.sqrt(queryTokens.length);
}

/** Rank content records without external calls. Stable order breaks ties reproducibly. */
export function rankMedicalKnowledge<T extends { id: string; text: string }>(
  query: string,
  records: T[],
  limit = 8
): Array<T & { score: number }> {
  return records
    .map(record => ({ ...record, score: scoreMedicalKnowledgeLexically(query, record.text) }))
    .filter(record => record.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(Math.trunc(limit) || 1, 1), 20));
}

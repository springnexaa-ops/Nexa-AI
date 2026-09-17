export function validateCitations(answer: string, hits: unknown[]) {
  const ids = [...answer.matchAll(/\[E(\d+)\]/g)].map(m => Number(m[1]));
  const unique = [...new Set(ids)];
  const invalid = unique.filter(n => n < 1 || n > hits.length);
  const substantive = answer.split(/\n+/).map(x => x.trim()).filter(x => x.length > 80 && !/^\s*[-*#]/.test(x));
  const uncited = substantive.filter(x => !(/\[E\d+\]/.test(x)));
  return {
    valid: invalid.length === 0,
    ids: unique,
    invalid,
    uncitedCount: uncited.length,
    warning: invalid.length ? "invalid-evidence-citation" : uncited.length ? "some-substantive-paragraphs-uncited" : "ok",
  };
}

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_OUTPUT_TOKENS = 1400;

const IMAGE_TYPES = new Set(['image/png','image/jpeg','image/webp','image/gif','image/bmp','image/tiff']);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

async function toBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return btoa(binary);
}

function promptFor(name: string, kind: 'pdf' | 'image') {
  return `You are Nexa AI Document & Image Reader. Analyze the uploaded ${kind} itself: ${name}.

Read the available content carefully. Do not invent text, numbers, diagnoses, identities, measurements, findings, or missing pages. If something is unclear, unreadable, cropped, or absent, explicitly say so.

For PDFs: summarize the document, identify important sections, extract key facts/tables when legible, and preserve dates, names, numbers and units accurately. For medical PDFs, provide an assistive summary and clearly separate observed/documented information from interpretation; do not diagnose or prescribe.
For images: describe what is visibly present, read legible text, identify charts/tables/diagrams, and explain relevant visual information. For medical images or reports, provide only assistive interpretation and recommend qualified professional review for clinical decisions.

Return concise structured output with these headings:
DOCUMENT / IMAGE TYPE
KEY CONTENT
IMPORTANT DETAILS
TEXT / DATA READ
MEDICAL OR TECHNICAL FINDINGS (if applicable)
SUMMARY
LIMITATIONS

Be fast, factual and concise. Never claim certainty where the source is unclear.`;
}

export async function analyzeFile(request: Request, env: any): Promise<Response> {
  try {
    if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });
    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BYTES) return json(413, { ok: false, error: 'File exceeds the 20 MB limit.' });
    if (!env.GOOGLE_API_KEY) return json(503, { ok: false, error: 'Document and image reading is not configured: GOOGLE_API_KEY is missing.' });

    const form = await request.formData();
    const value = form.get('file');
    if (!(value instanceof File)) return json(400, { ok: false, error: 'Please upload a PDF or image.' });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: 'File exceeds the 20 MB limit.' });

    const name = value.name || 'uploaded-file';
    const mime = value.type || (name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
    const isPdf = mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
    const isImage = IMAGE_TYPES.has(mime) || mime.startsWith('image/');
    if (!isPdf && !isImage) return json(415, { ok: false, error: 'Nexa Reader accepts PDF, PNG, JPG/JPEG, WEBP, GIF, BMP or TIFF files.' });

    const data = await toBase64(value);
    const model = env.GOOGLE_MODEL || 'gemini-2.5-flash';
    const body = {
      contents: [{ role: 'user', parts: [
        { text: promptFor(name, isPdf ? 'pdf' : 'image') },
        { inline_data: { mime_type: isPdf ? 'application/pdf' : mime, data } },
      ] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: MAX_OUTPUT_TOKENS },
    };

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GOOGLE_API_KEY)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(18000),
    });
    if (!r.ok) return json(502, { ok: false, error: `Nexa Reader provider failed (HTTP ${r.status}).` });
    const d: any = await r.json();
    const analysis = d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
    if (!analysis) return json(502, { ok: false, error: 'Nexa Reader received no readable result.' });

    return json(200, { ok: true, analysis, file: { name, size: value.size, mimeType: isPdf ? 'application/pdf' : mime }, provider: 'google', model, engine: 'Nexa Document & Image Reader 1.0', disclaimer: 'Assistive reading only. Verify important information against the original document/image and obtain qualified clinical review for medical decisions.' });
  } catch (error) {
    return json(500, { ok: false, error: 'Nexa Reader failed.', detail: error instanceof Error ? error.message : 'Unknown reader error' });
  }
}

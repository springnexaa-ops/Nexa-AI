const MAX_BYTES = 20 * 1024 * 1024;
const MAX_ANALYSIS_BYTES = 12 * 1024 * 1024;
const MAX_TEXT = 250_000;

const TEXT_EXTENSIONS = new Set(['txt','md','csv','json','xml','html','htm','log','rtf']);
const OFFICE_EXTENSIONS = new Set(['doc','docx','xls','xlsx','ppt','pptx']);
const AUDIO_EXTENSIONS = new Set(['mp3','wav','m4a','ogg','webm','flac']);
const IMAGE_EXTENSIONS = new Set(['png','jpg','jpeg','webp','gif','bmp','tiff','tif']);

function ext(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

async function resolveGeminiModel(env: any): Promise<string> {
  const apiKey = String(env.GOOGLE_API_KEY || '').trim();
  if (!apiKey) throw new Error('GOOGLE_API_KEY is missing');

  const preferred = String(env.GOOGLE_MODEL || '').trim();
  const r = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey),
    { method: 'GET', headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) },
  );
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error('Gemini model discovery failed (HTTP ' + r.status + '): ' + detail.slice(0, 180));
  }

  const data: any = await r.json();
  const models = Array.isArray(data?.models) ? data.models : [];
  const available = models
    .filter((m: any) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m: any) => String(m?.name || '').replace(/^models\//, '').trim())
    .filter(Boolean);

  if (!available.length) throw new Error('No Gemini model available for generateContent on this API key.');

  if (preferred && available.includes(preferred)) return preferred;

  const rank = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('flash') && n.includes('latest')) return 0;
    if (n.includes('flash') && n.includes('2.5')) return 1;
    if (n.includes('flash') && n.includes('2.0')) return 2;
    if (n.includes('flash')) return 3;
    if (n.includes('pro')) return 10;
    return 20;
  };
  available.sort((x, y) => rank(x) - rank(y) || x.localeCompare(y));
  return available[0];
}

function cleanText(value: string) {
  return value.replace(/\u0000/g, '').replace(/\r\n/g, '\n').slice(0, MAX_TEXT);
}

async function base64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return btoa(binary);
}

function analysisPrompt(filename: string) {
  return `You are Nexa AI EEG Review, a clinical decision-support assistant. Analyze the uploaded EEG document/image itself, not a hypothetical EEG. File: ${filename}.

Review every visible EEG page/trace that the model can access. First identify what is actually visible and legible. Do not invent waveform findings, montages, frequencies, patient details, seizure events, or a report impression.

Use this workflow:
1. Technical/recording information: montage or derivations, calibration if visible, sensitivity/time scale if visible, sampling/filters if stated, state (awake/drowsy/sleep) and artifacts.
2. Background: posterior dominant rhythm/frequency and amplitude when assessable, organization, continuity, symmetry, reactivity if assessable.
3. Abnormal slowing: focal or generalized, frequency and distribution when visible.
4. Epileptiform activity: spikes, sharp waves, spike-wave/polyspike-wave, periodic/rhythmic patterns, location and field when genuinely visible.
5. Events/seizures: only describe electrographic seizures or definite events when the trace provides sufficient visual evidence; otherwise say not demonstrated/indeterminate.
6. Activation and sleep features when present (eye opening, hyperventilation, photic stimulation, sleep transients).
7. Page/epoch observations: mention page numbers or time markers only when readable.
8. Impression: concise clinician-facing summary separating observed findings from interpretation.
9. Limitations: explicitly state image/PDF quality, missing metadata, montage limitations, or sections that could not be assessed.

Return exactly these headings:
TECHNICAL QUALITY
BACKGROUND
ABNORMAL SLOWING
EPILEPTIFORM ACTIVITY
EVENTS / SEIZURES
ACTIVATION / SLEEP
PAGE / EPOCH OBSERVATIONS
IMPRESSION
LIMITATIONS

Important safety rule: this is an assistive preliminary review, not an autonomous diagnosis. If the evidence is insufficient, say so. Do not prescribe treatment. Recommend qualified electroencephalographer/clinician review for the final interpretation.`;
}

async function geminiEEG(env: any, value: File, filename: string, mimeType: string) {
  if (!env.GOOGLE_API_KEY) return json(503, { ok: false, error: 'EEG analysis is not configured: GOOGLE_API_KEY is missing.' });
  if (value.size > MAX_ANALYSIS_BYTES) return json(413, { ok: false, error: 'EEG analysis is limited to 12 MB per PDF/image. Upload a smaller export or split the study into smaller files.' });
  const model = await resolveGeminiModel(env);
  const data = await base64(await value.arrayBuffer());
  const prompt = analysisPrompt(filename);
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GOOGLE_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data } }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2200 },
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    return json(502, { ok: false, error: `Gemini EEG analysis failed (HTTP ${r.status}).`, detail: detail.slice(0, 500) });
  }
  const d: any = await r.json();
  const analysis = d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
  if (!analysis) return json(502, { ok: false, error: 'Gemini returned no EEG analysis.' });
  return json(200, {
    ok: true,
    analysis,
    file: { name: filename, size: value.size, mimeType },
    provider: 'google',
    model,
    engine: 'Nexa EEG Review 1.0',
    disclaimer: 'Assistive preliminary EEG review only. Final interpretation requires qualified clinical review.',
  });
}

export { analyzeFile as analyzeUploadedEEG } from './file-reader';

export async function inspectUploadedFile(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) return json(413, { ok: false, error: 'File is larger than the 20 MB upload limit.' });

    const form = await request.formData();
    const value = form.get('file');
    if (!(value instanceof File)) return json(400, { ok: false, error: 'Please select a file.' });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: 'File is larger than the 20 MB upload limit.' });

    const filename = value.name || 'uploaded-file';
    const extension = ext(filename);
    const mimeType = value.type || 'application/octet-stream';
    const base = {
      ok: true,
      file: {
        name: filename,
        size: value.size,
        sizeMB: Number((value.size / 1048576).toFixed(2)),
        type: mimeType,
        extension,
      },
    };

    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return json(200, { ...base, supported: true, kind: 'pdf', extraction: 'metadata-only', text: '', message: 'PDF uploaded successfully. It is ready for EEG/document analysis.' });
    }
    if (TEXT_EXTENSIONS.has(extension) || mimeType.startsWith('text/')) {
      const text = cleanText(await value.text());
      return json(200, { ...base, supported: true, kind: 'text', extraction: 'plain-text', text, truncated: text.length >= MAX_TEXT, message: text ? 'File uploaded and text extracted successfully.' : 'File uploaded successfully; no text content was found.' });
    }
    if (IMAGE_EXTENSIONS.has(extension) || mimeType.startsWith('image/')) {
      return json(200, { ...base, supported: true, kind: 'image', extraction: 'metadata-only', text: '', message: 'Image uploaded successfully. It is ready for visual analysis.' });
    }
    if (OFFICE_EXTENSIONS.has(extension)) {
      return json(200, { ...base, supported: true, kind: 'office-document', extraction: 'metadata-only', text: '', message: 'Office document uploaded successfully. Binary document text extraction is not enabled in this endpoint.' });
    }
    if (AUDIO_EXTENSIONS.has(extension) || mimeType.startsWith('audio/')) {
      return json(200, { ...base, supported: true, kind: 'audio', extraction: 'metadata-only', text: '', message: 'Audio file uploaded successfully. Use Nexa Voice transcription for supported audio.' });
    }
    return json(200, { ...base, supported: false, kind: 'unknown', extraction: 'none', text: '', message: 'File uploaded successfully, but this file type is not configured for content extraction yet.' });
  } catch (error) {
    return json(500, { ok: false, error: 'File inspection failed.', detail: error instanceof Error ? error.message : 'Unknown file processing error' });
  }
}

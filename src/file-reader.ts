const MAX_BYTES = 20 * 1024 * 1024;
const MAX_OUTPUT_TOKENS = 180;

const IMAGE_TYPES = new Set(['image/png','image/jpeg','image/webp','image/gif','image/bmp','image/tiff']);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function toBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

function classifierPrompt(name: string, kind: 'pdf' | 'image') {
  return `You are Nexa AI Structured Medical Document Classifier. Classify the uploaded ${kind} itself: "${name}".

Your ONLY task is to identify the document type from its visible content. Do not summarize it. Do not extract patient details. Do not report measurements, waveforms, findings, diagnosis, impression, or recommendations.

Use these labels exactly when applicable:
- "NCS Report" = Nerve Conduction Study / NCV / nerve conduction report
- "EEG Report" = Electroencephalography / EEG report
- "EMG Report" = Electromyography report
- "VEP Report" = Visual Evoked Potential report
- "BAER/BERA Report" = Brainstem Auditory Evoked Response/Potential report
- "RNS Report" = Repetitive Nerve Stimulation report
- "Other Medical Report" = medical/diagnostic report that does not match the categories above
- "Non-Medical Document" = clearly non-medical document
- "Unknown Document" = content is insufficient or unreadable for classification

Return ONLY one label from the list above. No punctuation. No explanation. No extra words.

Important: classify from the document content, not the filename alone. If multiple terms appear, choose the actual primary report type represented by the document.`;
}

function normalizeType(raw: string) {
  const value = raw.trim().replace(/^["'`]+|["'`]+$/g, '').replace(/s+/g, ' ');
  const exact = [
    'NCS Report',
    'EEG Report',
    'EMG Report',
    'VEP Report',
    'BAER/BERA Report',
    'RNS Report',
    'Other Medical Report',
    'Non-Medical Document',
    'Unknown Document',
  ];
  const match = exact.find(label => value.toLowerCase() === label.toLowerCase());
  if (match) return match;

  const upper = value.toUpperCase();
  if (/\\bNCS\\b|NERVE CONDUCTION|NCV/.test(upper)) return 'NCS Report';
  if (/\\bEEG\\b|ELECTROENCEPHALOGRAPH/.test(upper)) return 'EEG Report';
  if (/\\bEMG\\b|ELECTROMYOGRAPH/.test(upper)) return 'EMG Report';
  if (/\\bVEP\\b|VISUAL EVOKED/.test(upper)) return 'VEP Report';
  if (/\\bBAER\\b|\\bBERA\\b|BRAINSTEM AUDITORY/.test(upper)) return 'BAER/BERA Report';
  if (/\\bRNS\\b|REPETITIVE NERVE STIMULATION/.test(upper)) return 'RNS Report';
  return 'Unknown Document';
}

export async function analyzeFile(request: Request, env: any): Promise<Response> {
  try {
    if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BYTES) return json(413, { ok: false, error: 'File exceeds the 20 MB limit.' });
    if (!env.GOOGLE_API_KEY) return json(503, { ok: false, error: 'Structured document classification is not configured: GOOGLE_API_KEY is missing.' });

    const form = await request.formData();
    const value = form.get('file');
    if (!(value instanceof File)) return json(400, { ok: false, error: 'Please upload a PDF or image.' });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: 'File exceeds the 20 MB limit.' });

    const name = value.name || 'uploaded-file';
    const mime = value.type || (name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
    const isPdf = mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
    const isImage = IMAGE_TYPES.has(mime) || mime.startsWith('image/');
    if (!isPdf && !isImage) return json(415, { ok: false, error: 'Nexa Structured Reader accepts PDF or image files.' });

    const data = await toBase64(value);
    const model = env.GOOGLE_MODEL || 'gemini-2.5-flash';
    const body = {
      contents: [{
        role: 'user',
        parts: [
          { text: classifierPrompt(name, isPdf ? 'pdf' : 'image') },
          { inline_data: { mime_type: isPdf ? 'application/pdf' : mime, data } },
        ],
      }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    };

    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) +
      ':generateContent?key=' + encodeURIComponent(env.GOOGLE_API_KEY),
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(18000),
      },
    );

    if (!r.ok) return json(502, { ok: false, error: 'Structured document classifier failed (HTTP ' + r.status + ').' });

    const d: any = await r.json();
    const raw = d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim() || '';
    const documentType = normalizeType(raw);

    return json(200, {
      ok: true,
      documentType,
      analysis: documentType,
      file: {
        name,
        size: value.size,
        mimeType: isPdf ? 'application/pdf' : mime,
      },
      provider: 'google',
      model,
      engine: 'Nexa Structured PDF Reader 1.0',
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: 'Structured document classification failed.',
      detail: error instanceof Error ? error.message : 'Unknown reader error',
    });
  }
}

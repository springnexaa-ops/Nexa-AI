const MAX_BYTES = 20 * 1024 * 1024;
const MODEL = "gemini-3.8-flash";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function base64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

const EEG_PROMPT = `You are Nexa AI Medical reviewing an uploaded EEG document.

Analyze the actual PDF pages, including waveform images, montage labels, annotations, tables and report text. Do not say that you cannot view the file when the PDF is provided successfully.

Produce a structured, evidence-linked EEG review with these sections:
1. Study identification and technical details visible in the document.
2. Recording quality and artifacts.
3. Background activity: posterior dominant rhythm, frequency, amplitude, symmetry, organization and reactivity when visible.
4. Sleep/drowsiness findings if present.
5. Focal abnormalities: focal slowing or other focal changes, with page/figure references where possible.
6. Generalized abnormalities: generalized slowing or other generalized changes.
7. Epileptiform activity: spikes, sharp waves, spike-and-wave, polyspike activity or rhythmic epileptiform patterns, including location/distribution and whether the finding is definite, probable or uncertain from the image.
8. Seizure/event assessment: only if an electrographic event is actually visible; describe onset, evolution, spread and duration when measurable. Do not invent seizures.
9. ECG/physiologic channels and artifacts when visible.
10. Impression: concise synthesis of what is actually demonstrated.
11. Limitations and what cannot be determined from the supplied pages.

Important safety rules: This is clinical decision support, not a definitive diagnosis. Never invent a waveform abnormality, patient history, medication, montage, frequency, or clinical event. If image quality or page resolution prevents reliable assessment, say so explicitly. Distinguish observed findings from interpretation. Recommend qualified neurologist/clinical neurophysiology review for the final report.`;

export async function analyzeUploadedEeg(request: Request, env: { GOOGLE_API_KEY?: string; GOOGLE_MODEL?: string }): Promise<Response> {
  try {
    if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });
    if (!env.GOOGLE_API_KEY) return json(503, { ok: false, error: "EEG document analysis is not configured because the Google AI provider is unavailable." });

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) return json(413, { ok: false, error: "EEG PDF is larger than the 20 MB upload limit." });

    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return json(400, { ok: false, error: "EEG PDF file is required." });
    if (!isPdf(value)) return json(415, { ok: false, error: "EEG document analysis currently requires a PDF file." });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: "EEG PDF is larger than the 20 MB upload limit." });

    const data = base64(new Uint8Array(await value.arrayBuffer()));
    const model = env.GOOGLE_MODEL || MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GOOGLE_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: EEG_PROMPT }] },
        contents: [{
          role: "user",
          parts: [
            { text: `Review the uploaded EEG PDF named "${value.name}". Analyze every page that contains EEG data or the written EEG report.` },
            { inlineData: { mimeType: "application/pdf", data } },
          ],
        }],
        generationConfig: { maxOutputTokens: 6000 },
      }),
      signal: AbortSignal.timeout(60000),
    });

    const raw = await response.text();
    let payload: any = null;
    try { payload = JSON.parse(raw); } catch { payload = null; }
    if (!response.ok) {
      return json(response.status >= 500 ? 502 : response.status, {
        ok: false,
        error: "EEG analysis provider returned an error.",
        detail: payload?.error?.message || raw.slice(0, 500) || `HTTP ${response.status}`,
      });
    }

    const analysis = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("\n").trim();
    if (!analysis) return json(502, { ok: false, error: "EEG analysis completed without a readable result." });

    return json(200, {
      ok: true,
      product: "Nexa AI Medical",
      modality: "EEG",
      file: { name: value.name, size: value.size },
      provider: "google",
      model,
      analysis,
      disclaimer: "AI-assisted EEG review is not a definitive diagnosis and must be reviewed by a qualified clinician/neurophysiologist.",
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: "EEG analysis failed.",
      detail: error instanceof Error ? error.message : "Unknown EEG analysis error",
    });
  }
}

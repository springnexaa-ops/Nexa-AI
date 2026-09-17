import worker from "./entry";
import { isMedicalQuery } from "./medical-directory";
import { getMedicalBookContext } from "./medical-book-knowledge";
import { queryLiveEvidence } from "./medical-live-evidence";

type Message = { role: "system" | "user" | "assistant"; content: string };

function looksLikeMedical(text: string): boolean {
  const q = text.toLowerCase();
  return isMedicalQuery(text) || /\b(ncs|ncvs|nerve conduction|emg|edx|electromyograph|rns|repetitive nerve stimulation|eeg|v[ .-]?ep|bera|baer|neuromuscular|neuropathy|radiculopathy|myopathy|seizure)\b/i.test(q);
}

function evidenceContext(hits: any[]): string {
  if (!hits.length) return "NEXA MEDICAL EVIDENCE RETRIEVAL: No sufficiently relevant indexed evidence was retrieved for this query. Do not invent evidence or citations. State what information is missing.";
  return [
    "NEXA MEDICAL EVIDENCE RETRIEVAL — PRIMARY EVIDENCE CONTEXT",
    "Use the retrieved NEXA evidence below as the primary factual reference for this answer. Do not substitute unsupported model memory for retrieved evidence.",
    ...hits.map((h, i) => `[E${i + 1}] ${h.title} | authority=${h.authority} | version=${h.version} | retrieved=${h.retrievedAt}\n${h.text}`),
    "Citation rule: cite substantive evidence-based statements with the corresponding [E#]. If the evidence does not establish a conclusion, say so explicitly."
  ].join("\n\n");
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/v1/chat/completions" || request.method !== "POST") return worker.fetch(request, env, ctx);

    try {
      const body: any = await request.clone().json();
      const messages: Message[] = Array.isArray(body?.messages) ? body.messages.filter((m: any) => m && typeof m.content === "string") : [];
      const userText = [...messages].reverse().find(m => m.role === "user")?.content || "";
      if (!looksLikeMedical(userText)) return worker.fetch(request, env, ctx);

      const hits = await queryLiveEvidence(env, userText, 8);
      const system = [
        getMedicalBookContext(userText),
        evidenceContext(hits),
        "NEXA MEDICAL ROUTING: This is a medical request. The internal NEXA medical knowledge/evidence layer has been queried before generation. Answer from the supplied NEXA context first. Patient-specific NCS/EMG interpretation must use only measurements actually provided; never fabricate absent values or reference ranges. Separate observations, interpretation, localization/pattern, limitations, and clinician-review requirements."
      ].join("\n\n");

      const priorSystem = messages.find(m => m.role === "system")?.content || "";
      const rebuilt: Message[] = [
        { role: "system", content: `${priorSystem ? priorSystem + "\n\n" : ""}${system}` },
        ...messages.filter(m => m.role !== "system")
      ];
      const nextBody = { ...body, mode: "medical", provider: "medical", messages: rebuilt };
      const nextRequest = new Request(request, { body: JSON.stringify(nextBody) });
      const response = await worker.fetch(nextRequest, env, ctx);
      const headers = new Headers(response.headers);
      headers.set("x-nexa-medical-retrieval", "primary");
      headers.set("x-nexa-medical-evidence-count", String(hits.length));
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch {
      // Preserve the existing authenticated/public request handling if retrieval cannot be performed.
      // The underlying medical path still provides its normal response and audit behavior.
      return worker.fetch(request, env, ctx);
    }
  }
};

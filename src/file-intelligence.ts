const MAX_BYTES = 20 * 1024 * 1024;
const MAX_TEXT = 250_000;
const TEXT_EXTENSIONS = new Set(["txt","md","csv","json","xml","html","htm","log","rtf"]);
const OFFICE_EXTENSIONS = new Set(["doc","docx","xls","xlsx","ppt","pptx"]);
const AUDIO_EXTENSIONS = new Set(["mp3","wav","m4a","ogg","webm","flac"]);
const IMAGE_EXTENSIONS = new Set(["png","jpg","jpeg","webp","gif","bmp","tiff","tif"]);

function ext(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}
function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function cleanText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").slice(0, MAX_TEXT);
}

export { analyzeFile as analyzeUploadedEEG } from "./file-reader";

export async function inspectUploadedFile(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) return json(413, { ok: false, error: "File is larger than the 20 MB upload limit." });

    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return json(400, { ok: false, error: "Please select a file." });
    if (value.size > MAX_BYTES) return json(413, { ok: false, error: "File is larger than the 20 MB upload limit." });

    const filename = value.name || "uploaded-file";
    const extension = ext(filename);
    const mimeType = value.type || "application/octet-stream";
    const base = { ok: true, file: { name: filename, size: value.size, sizeMB: Number((value.size / 1048576).toFixed(2)), type: mimeType, extension } };

    if (extension === "pdf" || mimeType === "application/pdf")
      return json(200, { ...base, supported: true, kind: "pdf", extraction: "cloudflare-workers-ai-markdown", text: "", message: "PDF uploaded successfully. It is ready for NEXA Medical document analysis." });
    if (TEXT_EXTENSIONS.has(extension) || mimeType.startsWith("text/")) {
      const text = cleanText(await value.text());
      return json(200, { ...base, supported: true, kind: "text", extraction: "plain-text", text, truncated: text.length >= MAX_TEXT, message: text ? "File uploaded and text extracted successfully." : "File uploaded successfully; no text content was found." });
    }
    if (IMAGE_EXTENSIONS.has(extension) || mimeType.startsWith("image/"))
      return json(200, { ...base, supported: true, kind: "image", extraction: "metadata-only", text: "", message: "Image uploaded successfully. Use NEXA document analysis for visual-capable workflows." });
    if (OFFICE_EXTENSIONS.has(extension))
      return json(200, { ...base, supported: true, kind: "office-document", extraction: "metadata-only", text: "", message: "Office document uploaded successfully; binary document text extraction is not enabled in this endpoint." });
    if (AUDIO_EXTENSIONS.has(extension) || mimeType.startsWith("audio/"))
      return json(200, { ...base, supported: true, kind: "audio", extraction: "metadata-only", text: "", message: "Audio file uploaded successfully. Use Nexa Voice transcription for supported audio." });
    return json(200, { ...base, supported: false, kind: "unknown", extraction: "none", text: "", message: "File uploaded successfully, but this file type is not configured for content extraction yet." });
  } catch (error) {
    return json(500, { ok: false, error: "File inspection failed.", detail: error instanceof Error ? error.message : "Unknown file processing error" });
  }
}

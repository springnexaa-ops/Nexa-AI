const MAX_TEXT_CHARS = 120_000;
const MAX_FILENAME = 180;

export type ExtractedDocument = {
  name: string;
  type: string;
  size: number;
  text: string;
  truncated: boolean;
  metadata: Record<string, string | number | boolean>;
};

const clean = (value: unknown, max = MAX_FILENAME) => String(value ?? '').trim().slice(0, max);

function ext(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

export function supportedFileType(file: File) {
  const e = ext(file.name);
  const t = (file.type || '').toLowerCase();
  if (t.startsWith('text/') || ['txt','md','csv','json','xml','html','htm','log','rtf'].includes(e)) return 'text';
  if (t === 'application/pdf' || e === 'pdf') return 'pdf';
  if (t.includes('wordprocessingml') || e === 'docx') return 'docx';
  if (t === 'application/msword' || e === 'doc') return 'doc';
  if (t.includes('sheet') || ['xlsx','xls'].includes(e)) return 'spreadsheet';
  if (t.includes('presentation') || ['pptx','ppt'].includes(e)) return 'presentation';
  if (t.startsWith('image/') || ['png','jpg','jpeg','webp','gif','bmp','tiff'].includes(e)) return 'image';
  if (t.startsWith('audio/') || ['mp3','wav','m4a','ogg','webm','flac'].includes(e)) return 'audio';
  return 'binary';
}

export async function extractTextFile(file: File): Promise<ExtractedDocument> {
  const type = supportedFileType(file);
  if (type !== 'text') {
    throw new Error(`Unsupported document parser for ${file.name}. Supported text formats: TXT, MD, CSV, JSON, XML, HTML and LOG. PDF/DOCX/XLSX/PPTX/images/audio should use their dedicated analysis pipeline.`);
  }
  const raw = await file.text();
  const normalized = normalizeText(raw);
  const truncated = normalized.length > MAX_TEXT_CHARS;
  const text = normalized.slice(0, MAX_TEXT_CHARS);
  return {
    name: clean(file.name),
    type,
    size: file.size,
    text,
    truncated,
    metadata: {
      extension: ext(file.name),
      characters: normalized.length,
      returnedCharacters: text.length,
      truncated
    }
  };
}

export function chunkText(text: string, size = 3000, overlap = 350) {
  const source = text.trim();
  if (!source) return [] as string[];
  const chunks: string[] = [];
  let start = 0;
  while (start < source.length) {
    const end = Math.min(source.length, start + size);
    const chunk = source.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= source.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

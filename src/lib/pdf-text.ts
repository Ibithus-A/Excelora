import { promises as fs } from "node:fs";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";

type CacheEntry = {
  mtimeMs: number;
  text: string;
};

const MAX_PDF_TEXT_CHARS = 60_000;
const cache = new Map<string, CacheEntry>();

export async function readPdfTextForSubtopic(title: string): Promise<string | null> {
  const safeTitle = title.trim();
  if (!safeTitle || safeTitle.includes("/") || safeTitle.includes("\\") || safeTitle.includes("..")) {
    return null;
  }

  const pdfPath = path.join(process.cwd(), "public", "assets", `${safeTitle}.pdf`);

  let stat;
  try {
    stat = await fs.stat(pdfPath);
  } catch {
    return null;
  }

  const cached = cache.get(safeTitle);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.text;
  }

  const buffer = await fs.readFile(pdfPath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const joined = Array.isArray(text) ? text.join("\n\n") : text;
  const trimmed = joined.slice(0, MAX_PDF_TEXT_CHARS);

  cache.set(safeTitle, { mtimeMs: stat.mtimeMs, text: trimmed });
  return trimmed;
}

import * as pdfjs from 'pdfjs-dist';

// PDF.js worker needs to be loaded from the CDN-compatible local file
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Extract text from a File (PDF, DOCX/DOC, TXT/MD) client-side. */
export async function extractFileText(file: File): Promise<{ title: string; text: string }> {
  const title = file.name;
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  // PDF
  if (ext === 'pdf') {
    return { title, text: await extractFromPdf(file) };
  }

  // DOCX (Word 2007+)
  if (ext === 'docx') {
    return { title, text: await extractFromDocx(file) };
  }

  // TXT / MD / CSV / JSON — plain text
  if (['txt', 'md', 'csv', 'json', 'text', 'log'].includes(ext)) {
    return { title, text: await file.text() };
  }

  // Fallback: try as text
  try {
    const text = await file.text();
    return { title, text };
  } catch {
    throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`);
  }
}

async function extractFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  // Configure the worker (avoid bundler worker resolution issues)
  try {
    (pdfjs as any).GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch {
    // fallback worker path
    (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs';
  }

  const pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(buffer) }).promise;

  let fullText = '';
  const maxPages = Math.min(pdf.numPages, 8); // cap to avoid memory blowups
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (typeof item.str === 'string' ? item.str + ' ' : ''))
      .join('')
      .replace(/\s{2,}/g, ' ');
    fullText += `\n${pageText}`;
  }

  return fullText.trim() || 'The PDF contains no extractable text (may be a scanned image).';
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const raw = result.value || '';
  return raw.replace(/\s{2,}/g, ' ').trim() || 'The DOCX contains no extractable text.';
}

/** Human-readable file size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

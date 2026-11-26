import { Document, Packer, Paragraph, TextRun } from 'docx'
import { normalizeDraft } from './format.js'

export function fileSlug(value) {
  return String(value || 'patrawali')
    .normalize('NFKC')
    .toLocaleLowerCase('en-IN')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'patrawali'
}

export async function downloadWord(message, fileNumber) {
  const lines = normalizeDraft(message?.draft_content).split('\n')
  const paragraphs = lines.map((line) => new Paragraph({
    children: [new TextRun({
      text: line || ' ',
      font: { ascii: 'Mangal', hAnsi: 'Mangal', cs: 'Mangal', eastAsia: 'Mangal' },
      size: 24,
      sizeComplexScript: 24,
    })],
    spacing: { line: 360 },
  }))
  const document = new Document({
    sections: [{ children: paragraphs }],
  })
  const blob = await Packer.toBlob(document)
  triggerDownload(blob, `${fileSlug(fileNumber)}-draft.docx`)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function printDraft(message) {
  const normalized = normalizeDraft(message?.draft_content)
  const safeText = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('प्रिंट विंडो नहीं खुली। कृपया पॉप-अप की अनुमति दें।')
  printWindow.opener = null
  printWindow.document.open()
  printWindow.document.write(`<!doctype html>
    <html lang="hi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>आलेखन सहायक — मसौदा</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 25mm; }
          body { margin: 0; color: #111; font-family: "Noto Sans Devanagari", "Noto Sans", sans-serif; font-size: 13pt; line-height: 1.7; }
          pre { margin: 0; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; }
          @media screen { body { max-width: 760px; margin: 30px auto; padding: 28px; background: #fff; box-shadow: 0 2px 20px #0002; } }
        </style>
      </head>
      <body><pre>${safeText}</pre></body>
    </html>`)
  printWindow.document.close()
  const ready = printWindow.document.fonts?.ready || Promise.resolve()
  ready.then(() => {
    printWindow.focus()
    printWindow.print()
  })
}

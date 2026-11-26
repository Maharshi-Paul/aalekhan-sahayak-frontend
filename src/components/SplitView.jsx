import { useMemo } from 'react'
import { normalizeDraft } from '../utils/format.js'
import { getReferenceChecks, highlightedSegments } from '../utils/refcheck.js'

export default function SplitView({ sourceMessage, draftMessage, facts = {}, onClose }) {
  const draft = useMemo(() => normalizeDraft(draftMessage?.draft_content), [draftMessage])
  const checks = useMemo(() => getReferenceChecks(facts, draftMessage?.draft_content), [facts, draftMessage])
  const matchValues = checks.filter((check) => check.status === 'in-draft').map((check) => check.value)
  const segments = useMemo(() => highlightedSegments(draft, matchValues), [draft, matchValues])
  const sourceUrl = sourceMessage?.source_url
  const isImage = sourceMessage?.source_type?.startsWith('image/')
    || /\.(png|jpe?g|webp)$/i.test(sourceMessage?.attachment_name || '')

  return (
    <div className="split-backdrop">
      <section className="split-panel" role="dialog" aria-modal="true" aria-labelledby="split-title">
        <header className="split-header">
          <div>
            <p className="eyebrow">Reference check</p>
            <h2 id="split-title">आवक पत्र और मसौदा</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="विभाजित दृश्य बंद करें">×</button>
        </header>
        <div className="reference-checks">
          {checks.map((check) => (
            <span className={`reference-chip reference-${check.status}`} key={check.key}>
              <strong>{check.label}</strong>
              <span>
                {check.status === 'in-draft'
                  ? '✓ in draft'
                  : check.status === 'not-extracted'
                    ? 'not extracted'
                    : 'not referenced'}
              </span>
            </span>
          ))}
        </div>
        <div className="split-columns">
          <section className="split-source" aria-label="आवक पत्र">
            <h3>आवक पत्र</h3>
            {sourceUrl
              ? isImage
                ? <img src={sourceUrl} alt="संलग्न आवक पत्र" />
                : <embed src={sourceUrl} type="application/pdf" title="संलग्न PDF आवक पत्र" />
              : <p className="not-extracted">इस मसौदे के लिए संलग्न स्रोत उपलब्ध नहीं है।</p>}
            {sourceMessage?.attachment_name && <p className="source-filename">{sourceMessage.attachment_name}</p>}
          </section>
          <section className="split-draft" aria-label="मसौदे का reference check">
            <h3>मसौदा · Reference check</h3>
            <pre>{segments.map((segment, index) => typeof segment === 'string'
              ? <span key={index}>{segment}</span>
              : <mark key={index}>{segment.match}</mark>)}</pre>
          </section>
        </div>
        <p className="reference-note">यह केवल reference check है, स्रोत-सत्यापन नहीं। अंतिम मसौदे की समीक्षा अधिकारी करें।</p>
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { normalizeDraft } from '../utils/format.js'

function draftSegments(text) {
  const matches = [...text.matchAll(/\[[^\]]*\]/g)]
  if (!matches.length) return [text]
  const segments = []
  let cursor = 0
  for (const match of matches) {
    if (match.index > cursor) segments.push(text.slice(cursor, match.index))
    segments.push({ placeholder: match[0] })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) segments.push(text.slice(cursor))
  return segments
}

function traceIcon(status) {
  if (status === 'completed') return '✓'
  if (status === 'verified') return '◈'
  if (status === 'auto-corrected') return '✎'
  return '○'
}

function urgencyTone(urgency = '') {
  const normalized = String(urgency || '').toLocaleLowerCase()
  if (normalized.includes('तत्काल') || normalized.includes('सर्वोच्च') || normalized.includes('urgent')) return 'urgency-high'
  if (normalized.includes('immediate') || normalized.includes('अति शीघ्र')) return 'urgency-medium'
  return 'urgency-normal'
}

function fixItems(instructions) {
  return instructions.split(/\n|(?<=[।.!?])\s+/).map((item) => item.trim()).filter(Boolean)
}

export default function DraftCard({
  message,
  version,
  onCopy,
  onDownloadWord,
  onPrint,
  onRefine,
  onToggleSource,
  onCompare,
  onQuickRefine,
  hasPrevious,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayText = useMemo(() => normalizeDraft(message.draft_content || ''), [message.draft_content])
  const segments = useMemo(() => draftSegments(displayText), [displayText])
  const placeholderCount = segments.filter((segment) => typeof segment !== 'string').length
  const audit = message.audit
  const passed = audit?.passed === true
  const checks = Array.isArray(audit?.checks) ? audit.checks : []
  const trace = Array.isArray(message.agent_trace) ? message.agent_trace : []
  const fixInstructions = typeof audit?.fix_instructions === 'string' ? audit.fix_instructions.trim() : ''
  const elapsed = Number.isFinite(message.duration_seconds) ? `${message.duration_seconds.toFixed(1)} s` : ''

  return (
    <section className="draft-card" aria-label={`मसौदा संस्करण ${version}`}>
      <div className="draft-meta">
        <span className="draft-format">{message.format_type || 'मसौदा'}</span>
        <span className={`urgency-badge ${urgencyTone(message.urgency)}`}>{message.urgency || 'सामान्य (Normal)'}</span>
        <span className={`audit-badge ${passed ? 'audit-passed' : 'audit-review'}`}>
          {passed ? 'Samiksha ✓' : 'Needs review'} {audit?.score || '—'}
        </span>
        <span className="version-badge">v{version}</span>
        {elapsed && <span className="duration-badge">Drafted in {elapsed}</span>}
      </div>

      {(message.summary || message.text) && <p className="routing-summary">{message.summary || message.text}</p>}

      {!passed && fixInstructions && (
        <details className="audit-fixes">
          <summary>समीक्षा निर्देश देखें</summary>
          <ul>{fixItems(fixInstructions).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        </details>
      )}
      {checks.length > 0 && (
        <details className="audit-checks">
          <summary>जांच सूची ({checks.length})</summary>
          <ul>{checks.map((check, index) => <li key={`${index}-${check}`}>{check}</li>)}</ul>
        </details>
      )}
      {trace.length > 0 && (
        <details className="agent-trace">
          <summary>Agent trace ({trace.length} चरण)</summary>
          <ul>
            {trace.map((item, index) => (
              <li key={`${index}-${item.agent || 'agent'}`}>
                <span className={`trace-icon trace-${item.status || 'unknown'}`} aria-hidden="true">{traceIcon(item.status)}</span>
                <span><strong>{item.agent || 'Agent'}</strong>{item.detail && <small>{item.detail}</small>}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className={`paper-preview ${isExpanded ? 'paper-expanded' : ''}`}>
        <pre>
          {segments.map((segment, index) => typeof segment === 'string'
            ? <span key={index}>{segment}</span>
            : <mark key={index}>{segment.placeholder}</mark>)}
        </pre>
        {!isExpanded && displayText.split('\n').length > 12 && <div className="paper-fade" aria-hidden="true" />}
      </div>
      {displayText.split('\n').length > 12 && (
        <button className="text-button draft-expand" onClick={() => setIsExpanded((current) => !current)}>
          {isExpanded ? 'मसौदा संक्षिप्त करें' : 'पूरा मसौदा दिखाएं'}
        </button>
      )}

      {placeholderCount > 0 && <span className="placeholder-chip">{placeholderCount} placeholders to fill</span>}

      <div className="draft-actions">
        <button className="button button-outline" onClick={() => onCopy?.(message.draft_content || '')}>कॉपी</button>
        <button className="button button-outline" onClick={() => onDownloadWord?.(message)}>Download Word</button>
        <button className="button button-outline" onClick={() => onPrint?.(message)}>Print / Save PDF</button>
        {onToggleSource && <button className="button button-outline" onClick={() => onToggleSource(message)}>View source ↔ draft</button>}
        {hasPrevious && <button className="button button-outline" onClick={() => onCompare?.(message)}>Compare with previous version</button>}
        <button className="button button-light" onClick={() => onRefine?.()}>Refine</button>
      </div>
      <div className="refine-chips" aria-label="त्वरित सुधार">
        {['और औपचारिक बनाएं', 'समय-सीमा 5 दिन करें', 'Translate to English', 'D.O. पत्र में बदलें', 'पत्रावली टिप्पण बनाएं'].map((instruction) => (
          <button
            type="button"
            className="template-chip"
            key={instruction}
            onClick={() => onQuickRefine?.(instruction)}
          >
            {instruction}
          </button>
        ))}
      </div>
    </section>
  )
}

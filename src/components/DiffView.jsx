import { diffLines } from 'diff'

export default function DiffView({ previous, current, onClose }) {
  const changes = diffLines(previous?.draft_content || '', current?.draft_content || '')
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="diff-modal" role="dialog" aria-modal="true" aria-labelledby="diff-title">
        <header className="drawer-header">
          <div>
            <p className="eyebrow">Version comparison</p>
            <h2 id="diff-title">पिछले संस्करण से तुलना</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="तुलना बंद करें">×</button>
        </header>
        <div className="diff-legend"><span>+ जोड़ा गया</span><span>− हटाया गया</span></div>
        <pre className="diff-content">{changes.map((part, index) => (
          <span
            className={part.added ? 'diff-added' : part.removed ? 'diff-removed' : ''}
            key={`${index}-${part.value.slice(0, 20)}`}
          >
            {part.value.split(/(?<=\n)/).map((line, lineIndex) => (
              <span className="diff-line" key={lineIndex}>
                {part.added ? '+ ' : part.removed ? '− ' : '  '}{line}
              </span>
            ))}
          </span>
        ))}</pre>
      </section>
    </div>
  )
}

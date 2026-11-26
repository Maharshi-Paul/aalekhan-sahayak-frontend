const factFields = [
  ['letter_number', 'पत्र संख्या'],
  ['letter_date', 'पत्र दिनांक'],
  ['sender_name_designation', 'प्रेषक'],
  ['recipient_designation', 'प्राप्तकर्ता'],
  ['subject', 'विषय'],
  ['deadline', 'समय-सीमा'],
]

function displayed(value) {
  if (Array.isArray(value)) return value.length ? value : null
  return typeof value === 'string' && value.trim() ? value : null
}

export default function FactsDrawer({ isOpen, facts = {}, stats, onClose }) {
  if (!isOpen) return null
  const keyFacts = displayed(facts.key_facts)
  const missingEnclosures = displayed(facts.missing_enclosures)

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <aside className="facts-drawer" role="dialog" aria-modal="true" aria-labelledby="facts-title">
        <header className="drawer-header">
          <div>
            <p className="eyebrow">पत्रावली संदर्भ</p>
            <h2 id="facts-title">Case facts</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Case facts बंद करें">×</button>
        </header>
        <div className="drawer-content">
          <section className="facts-section">
            <h3>निकाले गए तथ्य</h3>
            <dl className="facts-list">
              {factFields.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{displayed(facts[key]) || <span className="not-extracted">not extracted</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="facts-section">
            <h3>मुख्य तथ्य</h3>
            {keyFacts
              ? <ul className="key-facts">{keyFacts.map((fact, index) => <li key={`${index}-${fact}`}>{fact}</li>)}</ul>
              : <p className="not-extracted">not extracted</p>}
          </section>
          <section className={`facts-section enclosure-section ${missingEnclosures && missingEnclosures !== 'None' ? 'enclosure-warning' : ''}`}>
            <h3>अनुपलब्ध संलग्नक</h3>
            <p>{missingEnclosures || <span className="not-extracted">not extracted</span>}</p>
          </section>
          <section className="facts-section session-stats">
            <h3>Session stats <span>estimate</span></h3>
            <dl className="facts-list">
              <div><dt>Drafts generated</dt><dd>{stats.drafts}</dd></div>
              <div><dt>Average time</dt><dd>{stats.averageSeconds.toFixed(1)} s</dd></div>
              <div><dt>Estimated manual drafting time saved</dt><dd>{stats.savedMinutes.toFixed(1)} min</dd></div>
            </dl>
          </section>
        </div>
      </aside>
    </div>
  )
}

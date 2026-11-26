export default function ChatHeader({ thread, language, onLanguageChange, onBack, onOpenFacts }) {
  return (
    <header className="chat-header">
      <button className="icon-button mobile-back" onClick={onBack} aria-label="पत्रावलियों पर वापस जाएं">
        <span aria-hidden="true">←</span>
      </button>
      <span className="chat-header-mark" aria-hidden="true">▤</span>
      <div className="chat-heading">
        <strong>{thread.file_number || 'नई पत्रावली'}</strong>
        <span>{thread.subject || 'विषय पहली प्रतिक्रिया के बाद उपलब्ध होगा'}</span>
      </div>
      <label className="language-control">
        <span className="sr-only">मसौदे की भाषा</span>
        <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
          <option value="Hindi">हिन्दी</option>
          <option value="English">English</option>
          <option value="Bilingual">द्विभाषी / Bilingual</option>
        </select>
      </label>
      <button className="button button-outline facts-button" onClick={onOpenFacts}>
        <span aria-hidden="true">▣</span> Case facts
      </button>
      <button className="icon-button mobile-menu" aria-label="अधिक विकल्प" title="अधिक विकल्प">
        <span aria-hidden="true">⋮</span>
      </button>
    </header>
  )
}

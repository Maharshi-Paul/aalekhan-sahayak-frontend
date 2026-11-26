import { useMemo, useState } from 'react'
import ThreadRow from './ThreadRow.jsx'

export default function Sidebar({
  threads,
  selectedKey,
  isLoading,
  error,
  onRetry,
  onSelect,
  onNewFile,
  onArchitecture,
  presentationMode,
  onPresentationToggle,
}) {
  const [query, setQuery] = useState('')
  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('hi-IN')
    return [...threads]
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .filter((thread) => (
        !normalizedQuery
        || `${thread.file_number || ''} ${thread.subject || ''}`.toLocaleLowerCase('hi-IN').includes(normalizedQuery)
      ))
  }, [threads, query])

  return (
    <aside className={`sidebar ${selectedKey ? 'has-active-thread' : ''}`} aria-label="पत्रावलियाँ">
      <header className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">▤</span>
            <div>
              <h1>आलेखन सहायक</h1>
              <span>Aalekhan Sahayak</span>
            </div>
          </div>
          <button className="icon-button sidebar-new-icon" onClick={onNewFile} aria-label="नई पत्रावली बनाएं" title="नई पत्रावली">
            <span aria-hidden="true">＋</span>
          </button>
          <button
            className={`icon-button sidebar-presentation ${presentationMode ? 'presentation-on' : ''}`}
            onClick={onPresentationToggle}
            aria-pressed={presentationMode}
            aria-label="Presentation mode"
            title="Presentation mode"
          >
            <span aria-hidden="true">⛶</span>
          </button>
        </div>
        <button className="button button-light sidebar-new-button" onClick={onNewFile}>
          <span aria-hidden="true">＋</span> नई पत्रावली / New file
        </button>
        <button className="button button-light architecture-button" onClick={onArchitecture}>
          <span aria-hidden="true">◇</span> How it works / कैसे काम करता है
        </button>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="पत्रावली खोजें"
            aria-label="फ़ाइल नंबर या विषय से खोजें"
          />
        </label>
      </header>

      <div className="thread-list" aria-live="polite">
        {error && (
          <div className="sidebar-error" role="alert">
            <p>{error}</p>
            <button className="text-button" onClick={onRetry}>पुनः प्रयास करें / Retry</button>
          </div>
        )}
        {isLoading ? (
          <div className="thread-skeletons" aria-label="पत्रावलियाँ लोड हो रही हैं">
            {[0, 1, 2, 3].map((item) => <div className="thread-skeleton" key={item} />)}
          </div>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <ThreadRow
              key={thread.key}
              thread={thread}
              isSelected={thread.key === selectedKey}
              onClick={() => onSelect(thread)}
            />
          ))
        ) : (
          <div className="sidebar-empty">
            <div className="empty-file-icon" aria-hidden="true">▤</div>
            <strong>{query ? 'कोई परिणाम नहीं मिला' : 'अभी कोई पत्रावली नहीं'}</strong>
            <p>{query ? 'दूसरा फ़ाइल नंबर या विषय खोजें।' : 'अपनी पहली पत्रावली से शुरुआत करें।'}</p>
            {!query && <button className="button button-primary" onClick={onNewFile}>नई पत्रावली बनाएं</button>}
          </div>
        )}
      </div>
      <div className="sidebar-footer">
        <span className="status-dot" aria-hidden="true" />
        <span>पत्र-लेखन सहायक</span>
      </div>
    </aside>
  )
}

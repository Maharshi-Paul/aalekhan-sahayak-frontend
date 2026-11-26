import { formatRelativeTime } from '../utils/format.js'

function lastFormat(thread) {
  const lastAssistant = [...(thread.messages || [])].reverse().find((message) => message.role === 'assistant')
  return lastAssistant?.format_type || ''
}

export default function ThreadRow({ thread, isSelected, onClick }) {
  const format = lastFormat(thread)
  return (
    <button
      className={`thread-row ${isSelected ? 'thread-row-selected' : ''}`}
      onClick={onClick}
      aria-current={isSelected ? 'page' : undefined}
    >
      <span className="thread-avatar" aria-hidden="true">▤</span>
      <span className="thread-copy">
        <span className="thread-row-top">
          <strong>{thread.file_number || 'नई पत्रावली'}</strong>
          <time dateTime={thread.updated_at || undefined}>{formatRelativeTime(thread.updated_at)}</time>
        </span>
        <span className="thread-subject">{thread.subject || 'विषय उपलब्ध नहीं'}</span>
        <span className="thread-row-bottom">
          <span className="thread-id">{thread.thread_id || 'नई'}</span>
          {format && <span className="format-badge">{format}</span>}
        </span>
      </span>
    </button>
  )
}

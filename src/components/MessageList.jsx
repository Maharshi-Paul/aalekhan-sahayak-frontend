import { useEffect, useRef } from 'react'
import AssistantBubble from './AssistantBubble.jsx'
import UserBubble from './UserBubble.jsx'

export default function MessageList({ messages, error, onRetry }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="message-list" role="log" aria-label="संदेश" aria-live="polite">
      {messages.map((message, index) => (
        message.role === 'user'
          ? <UserBubble key={`${message.timestamp || 'user'}-${index}`} message={message} />
          : <AssistantBubble key={`${message.timestamp || 'assistant'}-${index}`} message={message} />
      ))}
      {error && (
        <div className="message-line message-line-assistant">
          <div className="request-error-bubble" role="alert">
            <p>{error}</p>
            <button type="button" className="button button-outline" onClick={onRetry}>पुनः प्रयास करें / Retry</button>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

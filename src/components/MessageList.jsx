import { useEffect, useRef } from 'react'
import AssistantBubble from './AssistantBubble.jsx'
import UserBubble from './UserBubble.jsx'

export default function MessageList({ messages }) {
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
      <div ref={bottomRef} />
    </div>
  )
}

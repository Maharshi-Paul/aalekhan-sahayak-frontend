import { useEffect, useRef } from 'react'
import AgentProgress from './AgentProgress.jsx'
import AssistantBubble from './AssistantBubble.jsx'
import UserBubble from './UserBubble.jsx'

export default function MessageList({
  messages,
  error,
  onRetry,
  isBusy,
  activeStepIndex,
  hasDocument,
  onCopy,
  onDownloadWord,
  onPrint,
  onRefine,
  onToggleSource,
  onCompare,
  onQuickRefine,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, error, isBusy, activeStepIndex])

  return (
    <div className="message-list" role="log" aria-label="संदेश" aria-live="polite">
      {messages.map((message, index) => {
        const draftVersion = message.role === 'assistant' && message.draft_content
          ? messages.slice(0, index + 1).filter((item) => item.role === 'assistant' && item.draft_content).length
          : 0
        const hasSource = message.role === 'assistant' && Boolean(message.draft_content)
          && messages.slice(0, index).some((item) => item.role === 'user' && item.source_url)
        return message.role === 'user'
          ? <UserBubble key={`${message.timestamp || 'user'}-${index}`} message={message} />
          : <AssistantBubble
            key={`${message.timestamp || 'assistant'}-${index}`}
            message={message}
            version={draftVersion}
            hasPrevious={draftVersion > 1}
            onCopy={onCopy}
            onDownloadWord={onDownloadWord}
            onPrint={onPrint}
            onRefine={onRefine}
            onToggleSource={hasSource ? onToggleSource : null}
            onCompare={onCompare}
            onQuickRefine={onQuickRefine}
          />
      })}
      {isBusy && (
        <div className="message-line message-line-assistant">
          <div className="message-bubble assistant-bubble">
            <AgentProgress activeStepIndex={activeStepIndex} hasDocument={hasDocument} />
          </div>
        </div>
      )}
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

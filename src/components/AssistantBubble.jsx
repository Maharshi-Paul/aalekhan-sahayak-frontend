import { formatMessageTime } from '../utils/format.js'
import DraftCard from './DraftCard.jsx'

export default function AssistantBubble({
  message,
  version,
  hasPrevious,
  onCopy,
  onDownloadWord,
  onPrint,
  onRefine,
  onToggleSource,
  onCompare,
}) {
  return (
    <div className="message-line message-line-assistant">
      <article className="message-bubble assistant-bubble">
        {message.draft_content
          ? <DraftCard
            message={message}
            version={version}
            hasPrevious={hasPrevious}
            onCopy={onCopy}
            onDownloadWord={onDownloadWord}
            onPrint={onPrint}
            onRefine={onRefine}
            onToggleSource={onToggleSource}
            onCompare={onCompare}
          />
          : message.text && <p className="assistant-routing">{message.text}</p>}
        <time>{formatMessageTime(message.timestamp)}</time>
      </article>
    </div>
  )
}

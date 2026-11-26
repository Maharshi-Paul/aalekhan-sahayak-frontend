import { formatMessageTime } from '../utils/format.js'

export default function AssistantBubble({ message }) {
  return (
    <div className="message-line message-line-assistant">
      <article className="message-bubble assistant-bubble">
        {message.text && <p className="assistant-routing">{message.text}</p>}
        {message.draft_content && (
          <pre className="early-draft-preview">{message.draft_content}</pre>
        )}
        <time>{formatMessageTime(message.timestamp)}</time>
      </article>
    </div>
  )
}

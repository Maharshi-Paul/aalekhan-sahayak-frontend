import { formatMessageTime } from '../utils/format.js'

export default function UserBubble({ message }) {
  return (
    <div className="message-line message-line-user">
      <article className="message-bubble user-bubble">
        {message.text && <p>{message.text}</p>}
        {message.attachment_name && (
          <span className="attachment-chip">
            <span aria-hidden="true">▧</span>
            <span>{message.attachment_name}</span>
          </span>
        )}
        <time>{formatMessageTime(message.timestamp)}</time>
      </article>
    </div>
  )
}

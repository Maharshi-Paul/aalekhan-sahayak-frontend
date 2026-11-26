export function formatRelativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  }
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

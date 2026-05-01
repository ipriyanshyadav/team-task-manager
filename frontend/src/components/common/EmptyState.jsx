import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="empty-state">
      <Inbox size={48} />
      <h3>{title}</h3>
      {message && <p style={{ fontSize: 13, marginBottom: 16 }}>{message}</p>}
      {action}
    </div>
  )
}

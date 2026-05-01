export function StatusBadge({ status }) {
  const labels = { todo: 'To Do', in_progress: 'In Progress', 'in-progress': 'In Progress', done: 'Done' }
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>
}

export function PriorityBadge({ priority }) {
  const icons = { low: '↓', medium: '→', high: '↑' }
  return (
    <span className={`badge badge-${priority}`}>
      {icons[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
}

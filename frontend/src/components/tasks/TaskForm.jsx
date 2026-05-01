import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { tasksApi } from '../../api/tasks'
import { projectsApi } from '../../api/projects'
import { usersApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export function TaskForm({ task, defaultProjectId, onClose, onSaved }) {
  const isEdit = !!task
  const { isAdmin } = useAuth()
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    project_id: task?.project_id || defaultProjectId || '',
    assigned_to: task?.assigned_to || '',
  })
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [projRes, membersRes] = await Promise.all([
          projectsApi.list({ page_size: 100 }),
          usersApi.members(),
        ])
        setProjects(projRes.data.items)
        setMembers(membersRes.data)
      } catch {
        // silently fail
      }
    }
    loadOptions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.project_id) { toast.error('Please select a project'); return }
    setLoading(true)
    const payload = {
      ...form,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      project_id: Number(form.project_id),
      due_date: form.due_date || null,
    }
    try {
      if (isEdit) {
        await tasksApi.update(task.id, payload)
        toast.success('Task updated')
      } else {
        await tasksApi.create(payload)
        toast.success('Task created')
      }
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Task' : 'New Task'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Details about this task..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Project *</label>
            <select
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              disabled={!!defaultProjectId && !isEdit}
            >
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label>Assign to</label>
            <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
        )}
      </form>
    </Modal>
  )
}

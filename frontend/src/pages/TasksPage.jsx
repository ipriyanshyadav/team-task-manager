import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tasksApi } from '../api/tasks'
import { useAuth } from '../context/AuthContext'
import { TaskForm } from '../components/tasks/TaskForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { StatusBadge, PriorityBadge } from '../components/common/Badge'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export function TasksPage() {
  const { isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    project_id: searchParams.get('project_id') || '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await tasksApi.list(params)
      setData(res.data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const applyFilter = (key, value) => {
    setPage(1)
    setFilters(f => ({ ...f, [key]: value }))
  }

  const clearFilters = () => {
    setPage(1)
    setFilters({ search: '', status: '', priority: '', project_id: '' })
    setSearchParams({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tasksApi.delete(deleteTask.id)
      toast.success('Task deleted')
      setDeleteTask(null)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h1>Tasks</h1>
          <p>{data?.total ?? 0} task{data?.total !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => applyFilter('search', e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
        <select value={filters.status} onChange={(e) => applyFilter('status', e.target.value)} style={{ width: 140 }}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filters.priority} onChange={(e) => applyFilter('priority', e.target.value)} style={{ width: 140 }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {hasFilters && (
          <button className="btn-secondary" onClick={clearFilters} style={{ padding: '10px 14px' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? <Spinner center /> : (
        <>
          {!data?.items?.length ? (
            <EmptyState
              title="No tasks found"
              message={hasFilters ? 'Try adjusting your filters' : 'Create your first task to get started'}
              action={!hasFilters && (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Create Task
                </button>
              )}
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned to</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(task => {
                      const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date))
                      return (
                        <tr key={task.id}>
                          <td>
                            <div style={{ fontWeight: 500, marginBottom: 2 }}>{task.title}</div>
                            {task.description && (
                              <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td><StatusBadge status={task.status} /></td>
                          <td><PriorityBadge priority={task.priority} /></td>
                          <td>
                            {task.assignee ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: 'var(--accent)', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                                }}>
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 13 }}>{task.assignee.name}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            {task.due_date ? (
                              <span style={{ fontSize: 13, color: isOverdue ? 'var(--red)' : 'var(--text-2)' }}>
                                {isOverdue ? '⚠ ' : ''}{format(parseISO(task.due_date), 'MMM d, yyyy')}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button className="btn-icon" onClick={() => setEditTask(task)} title="Edit">
                                <Pencil size={14} />
                              </button>
                              {isAdmin && (
                                <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => setDeleteTask(task)} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination page={page} pages={data?.pages ?? 1} onPageChange={setPage} />
        </>
      )}

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          defaultProjectId={filters.project_id ? Number(filters.project_id) : undefined}
          onClose={() => { setShowForm(false); setEditTask(null) }}
          onSaved={() => { setShowForm(false); setEditTask(null); load() }}
        />
      )}

      {deleteTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Delete "${deleteTask.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTask(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

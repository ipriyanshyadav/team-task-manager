import { useState, useEffect, useCallback } from 'react'
import { projectsApi } from '../api/projects'
import { useAuth } from '../context/AuthContext'
import { ProjectForm } from '../components/projects/ProjectForm'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { Plus, Pencil, Trash2, FolderKanban, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function ProjectsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deleteProject, setDeleteProject] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await projectsApi.list({ page, page_size: 10 })
      setData(res.data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectsApi.delete(deleteProject.id)
      toast.success('Project deleted')
      setDeleteProject(null)
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
          <h1>Projects</h1>
          <p>{data?.total ?? 0} project{data?.total !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {loading ? <Spinner center /> : (
        <>
          {!data?.items?.length ? (
            <EmptyState
              title="No projects yet"
              message="Create your first project to get started"
              action={isAdmin && (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Create Project
                </button>
              )}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {data.items.map(project => (
                <div
                  key={project.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  onClick={() => navigate(`/tasks?project_id=${project.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--accent-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FolderKanban size={20} color="var(--accent-2)" />
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" onClick={() => { setEditProject(project); setShowForm(false) }} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => setDeleteProject(project)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{project.name}</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description || 'No description'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{project.task_count}</span> tasks
                      {project.creator && <span> · by {project.creator.name}</span>}
                    </div>
                    <ChevronRight size={14} color="var(--text-3)" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} pages={data?.pages ?? 1} onPageChange={setPage} />
        </>
      )}

      {(showForm || editProject) && (
        <ProjectForm
          project={editProject}
          onClose={() => { setShowForm(false); setEditProject(null) }}
          onSaved={() => { setShowForm(false); setEditProject(null); load() }}
        />
      )}

      {deleteProject && (
        <ConfirmDialog
          title="Delete Project"
          message={`Delete "${deleteProject.name}"? All tasks within this project will also be deleted. This action cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteProject(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

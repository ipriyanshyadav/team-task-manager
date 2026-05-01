import { useState } from 'react'
import { Modal } from '../common/Modal'
import { projectsApi } from '../../api/projects'
import toast from 'react-hot-toast'

export function ProjectForm({ project, onClose, onSaved }) {
  const isEdit = !!project
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await projectsApi.update(project.id, form)
        toast.success('Project updated')
      } else {
        await projectsApi.create(form)
        toast.success('Project created')
      }
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Project' : 'New Project'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label>Project name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Website Redesign"
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
            placeholder="What is this project about?"
            style={{ resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  )
}

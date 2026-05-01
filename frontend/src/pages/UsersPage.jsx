import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '../api/index'
import { useAuth } from '../context/AuthContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { RoleBadge } from '../components/common/Badge'
import { Trash2, ShieldCheck, ShieldOff, UserCog } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersApi.list({ page, page_size: 15 })
      setData(res.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin'
    try {
      await usersApi.update(user.id, { role: newRole })
      toast.success(`${user.name} is now ${newRole}`)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update role')
    }
  }

  const toggleActive = async (user) => {
    try {
      await usersApi.update(user.id, { is_active: !user.is_active })
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update user')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await usersApi.delete(deleteUser.id)
      toast.success('User deleted')
      setDeleteUser(null)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h1>User Management</h1>
          <p>{data?.total ?? 0} users registered</p>
        </div>
      </div>

      {loading ? <Spinner center /> : (
        <>
          {!data?.items?.length ? (
            <EmptyState title="No users found" />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(user => (
                      <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.5 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: user.id === currentUser.id ? 'var(--accent)' : 'var(--bg-4)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 14, color: user.id === currentUser.id ? '#fff' : 'var(--text)',
                              flexShrink: 0,
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {user.name}
                                {user.id === currentUser.id && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent-2)' }}>(you)</span>}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><RoleBadge role={user.role} /></td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 12, fontWeight: 500,
                            color: user.is_active ? 'var(--green)' : 'var(--text-3)',
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: user.is_active ? 'var(--green)' : 'var(--text-3)', display: 'inline-block' }} />
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td>
                          {user.id !== currentUser.id && (
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button
                                className="btn-icon"
                                onClick={() => toggleRole(user)}
                                title={user.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                              >
                                {user.role === 'admin' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => toggleActive(user)}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                              >
                                <UserCog size={14} />
                              </button>
                              <button
                                className="btn-icon"
                                style={{ color: 'var(--red)' }}
                                onClick={() => setDeleteUser(user)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination page={page} pages={data?.pages ?? 1} onPageChange={setPage} />
        </>
      )}

      {deleteUser && (
        <ConfirmDialog
          title="Delete User"
          message={`Permanently delete ${deleteUser.name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteUser(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

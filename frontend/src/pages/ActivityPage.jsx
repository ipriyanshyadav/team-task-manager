import { useState, useEffect, useCallback } from 'react'
import { activityApi } from '../api/index'
import { Spinner } from '../components/common/Spinner'
import { EmptyState } from '../components/common/EmptyState'
import { Pagination } from '../components/common/Pagination'
import { Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const ACTION_COLORS = {
  task_created: 'var(--green)',
  task_updated: 'var(--blue)',
  task_deleted: 'var(--red)',
  project_created: 'var(--accent)',
  project_updated: 'var(--yellow)',
  project_deleted: 'var(--red)',
}

const ACTION_ICONS = {
  task_created: '✦',
  task_updated: '✎',
  task_deleted: '✕',
  project_created: '◆',
  project_updated: '◈',
  project_deleted: '✕',
}

export function ActivityPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await activityApi.list({ page, page_size: 20 })
      setData(res.data)
    } catch {
      toast.error('Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h1>Activity Log</h1>
          <p>Track all actions in your workspace</p>
        </div>
      </div>

      {loading ? <Spinner center /> : (
        <>
          {!data?.items?.length ? (
            <EmptyState title="No activity yet" message="Actions will appear here as you work" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.items.map((log, i) => {
                const color = ACTION_COLORS[log.action] || 'var(--text-3)'
                const icon = ACTION_ICONS[log.action] || '·'
                return (
                  <div
                    key={log.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 10,
                      animation: `fadeIn 0.2s ease ${i * 0.03}s both`,
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color,
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {log.user?.name || 'System'}
                          </span>
                          {' '}
                          <span style={{ color: 'var(--text-2)', fontSize: 13 }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {log.details && (
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <Pagination page={page} pages={data?.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

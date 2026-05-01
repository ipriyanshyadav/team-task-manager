import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/index'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/common/Spinner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { CheckCircle2, Clock, AlertTriangle, FolderKanban, Users, ListTodo } from 'lucide-react'

const COLORS = ['#6c63ff', '#22c55e', '#3b82f6', '#eab308', '#ef4444']

function StatCard({ icon: Icon, label, value, color = 'var(--accent)', bg = 'var(--accent-glow)' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [projectSummaries, setProjectSummaries] = useState([])
  const [userSummaries, setUserSummaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.projectSummaries(),
        ])
        setStats(statsRes.data)
        setProjectSummaries(projRes.data)

        if (isAdmin) {
          const userRes = await dashboardApi.userSummaries()
          setUserSummaries(userRes.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin])

  if (loading) return <Spinner center />

  const pieData = stats ? [
    { name: 'To Do', value: stats.total_tasks - stats.completed_tasks - stats.in_progress_tasks },
    { name: 'In Progress', value: stats.in_progress_tasks },
    { name: 'Done', value: stats.completed_tasks },
  ].filter(d => d.value > 0) : []

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your task management overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={ListTodo} label="Total Tasks" value={stats?.total_tasks ?? 0} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.completed_tasks ?? 0} color="var(--green)" bg="var(--green-bg)" />
        <StatCard icon={Clock} label="In Progress" value={stats?.in_progress_tasks ?? 0} color="var(--blue)" bg="var(--blue-bg)" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue_tasks ?? 0} color="var(--red)" bg="var(--red-bg)" />
        <StatCard icon={FolderKanban} label="Projects" value={stats?.total_projects ?? 0} color="var(--yellow)" bg="var(--yellow-bg)" />
        {isAdmin && <StatCard icon={Users} label="Users" value={stats?.total_users ?? 0} color="var(--orange)" bg="var(--orange-bg)" />}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Task status pie */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Task Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>No task data</div>
          )}
        </div>

        {/* Project bar chart */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Tasks per Project</h3>
          {projectSummaries.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectSummaries.slice(0, 6)} margin={{ left: -20 }}>
                <XAxis dataKey="project_name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed_tasks" name="Done" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="in_progress_tasks" name="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="todo_tasks" name="To Do" fill="#6c63ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>No project data</div>
          )}
        </div>
      </div>

      {/* User summaries (admin only) */}
      {isAdmin && userSummaries.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Team Performance</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {userSummaries.map(u => {
                  const pct = u.total_tasks > 0 ? Math.round((u.completed_tasks / u.total_tasks) * 100) : 0
                  return (
                    <tr key={u.user_id}>
                      <td style={{ fontWeight: 500 }}>{u.user_name}</td>
                      <td>{u.total_tasks}</td>
                      <td style={{ color: 'var(--green)' }}>{u.completed_tasks}</td>
                      <td style={{ color: 'var(--yellow)' }}>{u.pending_tasks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-4)', borderRadius: 3 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 30 }}>{pct}%</span>
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
    </div>
  )
}

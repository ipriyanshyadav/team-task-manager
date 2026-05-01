import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, Activity, LogOut, Zap
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/activity', icon: Activity, label: 'Activity' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Users' },
]

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 220,
      height: '100vh',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--accent)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px var(--accent-glow)',
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Team Task Manager</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px', marginBottom: 4 }}>
          Main
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              color: isActive ? 'var(--accent-2)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              marginBottom: 2,
              transition: 'all 0.15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 10px 4px' }}>
              Admin
            </div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-2)' : 'var(--text-2)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  marginBottom: 2,
                  transition: 'all 0.15s',
                })}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div style={{
        padding: '14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 34, height: 34,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
          color: '#fff',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Logout">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}

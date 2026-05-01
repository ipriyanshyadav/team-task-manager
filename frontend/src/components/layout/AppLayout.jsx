import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <Sidebar />
      </div>
      <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}

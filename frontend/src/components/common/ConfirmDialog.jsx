import { Modal } from './Modal'

export function ConfirmDialog({ title, message, onConfirm, onClose, loading }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  )
}

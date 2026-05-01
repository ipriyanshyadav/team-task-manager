export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  const getPages = () => {
    const result = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      result.push(i)
    }
    if (result[0] > 1) result.unshift('...')
    if (result[result.length - 1] < pages) result.push('...')
    if (!result.includes(1)) result.unshift(1)
    if (!result.includes(pages)) result.push(pages)
    return result
  }

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>←</button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'var(--text-3)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            className={p === page ? 'active' : ''}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}>→</button>
    </div>
  )
}

export function Spinner({ size = 20, center = false }) {
  const el = (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  )
  if (center) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        {el}
      </div>
    )
  }
  return el
}

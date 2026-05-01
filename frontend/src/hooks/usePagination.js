import { useState } from 'react'

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(initialPageSize)

  const reset = () => setPage(1)

  return { page, setPage, pageSize, reset }
}

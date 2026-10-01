function Pagination({ page, data, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / 5))

  return (
    <nav className="pagination" aria-label="Patient list pages">
      <button
        className="button button-quiet pagination-button"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!data?.previous || page <= 1}
      >
        Previous
      </button>
      <span className="pagination-label">Page {page} of {totalPages}</span>
      <button
        className="button button-quiet pagination-button"
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!data?.next || page >= totalPages}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination

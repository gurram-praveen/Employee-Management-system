export default function Pagination({
  page, totalPages, totalElements, size, onPageChange, onPageSizeChange, pageSizes = [],
}) {
  if (totalElements === 0) return null;
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="pagination">
      <span className="muted">
        Showing {from}-{to} of {totalElements}
      </span>
      <div className="pagination-controls">
        {onPageSizeChange && (
          <label className="page-size-control">
            Rows
            <select aria-label="Rows per page" value={size} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
              {pageSizes.map((pageSize) => <option key={pageSize} value={pageSize}>{pageSize}</option>)}
            </select>
          </label>
        )}
        <button className="btn" disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <span aria-hidden="true">‹</span>
          Previous
        </button>
        <span className="page-number">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          className="btn"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

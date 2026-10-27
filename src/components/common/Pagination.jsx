export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <i className="fa-solid fa-chevron-left" />
      </button>
      {pages.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        <i className="fa-solid fa-chevron-right" />
      </button>
    </nav>
  );
}
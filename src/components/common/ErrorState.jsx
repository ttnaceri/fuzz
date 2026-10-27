export default function ErrorState({ title = 'Something went wrong', message = '', onRetry }) {
  return (
    <div className="state" role="alert">
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2.5rem', color: 'var(--color-error)' }} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <i className="fa-solid fa-rotate-right" /> Retry
        </button>
      )}
    </div>
  );
}
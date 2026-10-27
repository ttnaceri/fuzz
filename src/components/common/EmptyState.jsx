export default function EmptyState({ icon = 'fa-box-open', title = 'Nothing here', message = '' }) {
  return (
    <div className="state">
      <i className={`fa-solid ${icon}`} style={{ fontSize: '2.5rem' }} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
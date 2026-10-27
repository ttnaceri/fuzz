import Sidebar from '../common/Sidebar.jsx';

export default function SecurityPage() {
  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Security</h1>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="text-muted">Password changes, 2FA and session management require backend support.</p>
        </div>
      </div>
    </div>
  );
}
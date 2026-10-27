import Sidebar from '../common/Sidebar.jsx';
import { api } from '../services/api.js';

export default function DownloadsPage() {
  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Downloads</h1>
        {!api.isConfigured() && (
          <div className="unavailable-notice">
            <i className="fa-solid fa-info-circle" /> Download manager requires backend.
          </div>
        )}
      </div>
    </div>
  );
}
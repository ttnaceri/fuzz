import { useTheme } from '../context/useTheme.js';
import Sidebar from '../common/Sidebar.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Settings</h1>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p>Current theme: <strong>{theme}</strong></p>
          <button className="btn btn-secondary mt-2" onClick={toggleTheme}>Toggle theme</button>
        </div>
      </div>
    </div>
  );
}
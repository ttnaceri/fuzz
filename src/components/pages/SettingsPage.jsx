import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import Sidebar from '../common/Sidebar.jsx';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const handleImport = () => {
    // Import mantiqi
    success("Import oynasi ochildi (funksiya ishlab chiqilmoqda)");
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', maxWidth: '800px' }}>
        <h1 className="page-title">Settings</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '1rem', textAlign: 'left', textDecoration: 'none', color: '#fff' }}>
            <i className="fa-solid fa-user" style={{ marginRight: '10px' }}></i> Edit Profile
          </Link>
          <Link to="/security" className="btn btn-secondary" style={{ padding: '1rem', textAlign: 'left', textDecoration: 'none', color: '#fff' }}>
            <i className="fa-solid fa-shield" style={{ marginRight: '10px' }}></i> Security Settings
          </Link>
          <Link to="/notifications" className="btn btn-secondary" style={{ padding: '1rem', textAlign: 'left', textDecoration: 'none', color: '#fff' }}>
            <i className="fa-solid fa-bell" style={{ marginRight: '10px' }}></i> Notification Preferences
          </Link>
        </div>

        {/* DANGER ZONE */}
        <div style={{ marginTop: '3rem', border: '1px solid #ed5555', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ color: '#ed5555', marginTop: 0 }}>Danger Zone</h2>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>These actions are irreversible. Please be careful.</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={handleImport} className="btn btn-secondary" style={{ borderColor: '#ed5555', color: '#ed5555' }}>
              <i className="fa-solid fa-file-import" style={{ marginRight: '8px' }}></i> Import Data
            </button>
            <button className="btn btn-secondary" style={{ backgroundColor: '#ed5555', color: '#fff', border: 'none' }} onClick={() => error("Delete account funksiyasi hali qo'shilmagan")}>
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminPlatform() {
  const [stats, setStats] = useState({ users: 0, games: 0, revenue: 0 });

  useEffect(() => {
    api.get('/api/admin/stats').then(data => setStats(data));
  }, []);

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Platforma Moliyasi</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Umumiy Tushum</div>
          <div style={{ color: '#43b581', fontSize: '2rem', fontWeight: 'bold' }}>${stats.revenue}</div>
        </div>
      </div>
    </div>
  );
}
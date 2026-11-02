import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, games: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Boshqaruv Paneli</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Jami Foydalanuvchilar</div>
          <div style={{ color: '#f5eeee', fontSize: '2rem', fontWeight: 'bold' }}>
            {loading ? '...' : stats.users}
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Faol O'yinlar</div>
          <div style={{ color: '#f5eeee', fontSize: '2rem', fontWeight: 'bold' }}>
            {loading ? '...' : stats.games}
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Umumiy Balans</div>
          <div style={{ color: '#43b581', fontSize: '2rem', fontWeight: 'bold' }}>
            {loading ? '...' : `$${stats.revenue}`}
          </div>
        </div>
      </div>
    </div>
  );
}
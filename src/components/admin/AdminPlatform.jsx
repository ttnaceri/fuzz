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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Umumiy Balans</div>
          <div style={{ color: '#43b581', fontSize: '2rem', fontWeight: 'bold' }}>${stats.revenue}</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Foydalanuvchilar</div>
          <div style={{ color: '#f5eeee', fontSize: '2rem', fontWeight: 'bold' }}>{stats.users}</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>O'yinlar</div>
          <div style={{ color: '#f5eeee', fontSize: '2rem', fontWeight: 'bold' }}>{stats.games}</div>
        </div>
      </div>

      {/* Oddiy diagramma (bar chart) */}
      <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
        <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Haftalik Sotuvlar</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px' }}>
          {[20, 45, 30, 70, 90, 60, 40].map((val, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: '#8a1200', height: `${val}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', color: '#b9a6a2', fontSize: '0.7rem' }}>
                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
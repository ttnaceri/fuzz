import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminServer() {
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/server')
      .then(data => { setServer(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#fff' }}>Yuklanmoqda...</div>;

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Server Status</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Server Holati</div>
          <div style={{ color: '#43b581', fontSize: '1.5rem', fontWeight: 'bold' }}>{server?.status}</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Uptime</div>
          <div style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>{server?.uptime}</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>API So'rovlar</div>
          <div style={{ color: '#f0b44d', fontSize: '1.5rem', fontWeight: 'bold' }}>{server?.api_requests}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>CPU</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#100b0a', borderRadius: '4px' }}>
            <div style={{ width: `${server?.cpu}%`, height: '100%', backgroundColor: server?.cpu > 80 ? '#ed5555' : '#43b581', borderRadius: '4px' }}></div>
          </div>
          <div style={{ color: '#b9a6a2', marginTop: '0.5rem', textAlign: 'right' }}>{server?.cpu}%</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>RAM</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#100b0a', borderRadius: '4px' }}>
            <div style={{ width: `${server?.ram}%`, height: '100%', backgroundColor: server?.ram > 80 ? '#ed5555' : '#f0b44d', borderRadius: '4px' }}></div>
          </div>
          <div style={{ color: '#b9a6a2', marginTop: '0.5rem', textAlign: 'right' }}>{server?.ram}%</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Storage</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#100b0a', borderRadius: '4px' }}>
            <div style={{ width: `${server?.storage}%`, height: '100%', backgroundColor: server?.storage > 80 ? '#ed5555' : '#43b581', borderRadius: '4px' }}></div>
          </div>
          <div style={{ color: '#b9a6a2', marginTop: '0.5rem', textAlign: 'right' }}>{server?.storage}%</div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/api/admin/companies').then(data => setCompanies(data.companies || []));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Kompaniyalar</h1>
        <Link to="/admin/new-company" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Yangi Kompaniya
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {companies.map(c => (
          <div key={c.id} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', textAlign: 'center' }}>
            {c.logo ? <img src={c.logo} alt={c.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }} /> : <div style={{ width: '80px', height: '80px', backgroundColor: '#100b0a', margin: '0 auto 1rem', borderRadius: '8px' }}></div>}
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{c.name}</h3>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>{c.description || 'Tavsif yo\'q'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
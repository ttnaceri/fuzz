import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/api/admin/companies').then(data => setCompanies(data.companies || []));
  }, []);

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1 className="page-title">Kompaniyalar</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {companies.map(c => (
          <Link key={c.id} to={`/company/${c.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', textAlign: 'center', transition: 'transform 0.2s' }}>
              {c.logo ? <img src={c.logo} alt={c.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem' }} /> : <div style={{ width: '80px', height: '80px', backgroundColor: '#100b0a', margin: '0 auto 1rem', borderRadius: '8px' }}></div>}
              <h3 style={{ color: '#f5eeee', margin: 0 }}>{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
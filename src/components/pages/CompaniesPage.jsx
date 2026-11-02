import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/companies')
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Kompaniyalarni yuklashda xato:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1 className="page-title" style={{ color: '#f5eeee', marginBottom: '2rem' }}>Kompaniyalar</h1>
      
      {loading ? (
        <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p>
      ) : companies.length === 0 ? (
        <p style={{ color: '#b9a6a2' }}>Hozircha kompaniyalar yo'q.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {companies.map(c => (
            <Link key={c.id} to={`/company/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', textAlign: 'center', transition: 'transform 0.2s', height: '100%' }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#100b0a', margin: '0 auto 1rem', borderRadius: '8px' }}></div>
                )}
                <h3 style={{ color: '#f5eeee', margin: 0, fontSize: '1.1rem' }}>{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
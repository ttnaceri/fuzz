import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const { error: toastError } = useToast();

  const loadCompanies = () => {
    api.get('/api/admin/companies').then(data => setCompanies(data.companies || [])).catch(() => toastError("Yuklashda xato"));
  };

  useEffect(() => { loadCompanies(); }, []);

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Kompaniyalar</h1>
        <Link to="/admin/new-company" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>+ Yangi Kompaniya</Link>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Kompaniya qidirish..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ width: '100%', maxWidth: '400px', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {filtered.map(c => (
          <div key={c.id} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', textAlign: 'center' }}>
            {c.logo ? (
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={c.logo} alt={c.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>
            ) : (
              <div style={{ width: '80px', height: '80px', backgroundColor: '#100b0a', margin: '0 auto 1rem', borderRadius: '8px' }}></div>
            )}
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{c.name}</h3>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>{c.description || 'Tavsif yo\'q'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
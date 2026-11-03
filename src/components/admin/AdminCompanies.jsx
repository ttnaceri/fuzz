import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [editCompany, setEditCompany] = useState(null);
  const { success, error: toastError } = useToast();

  const loadCompanies = () => {
    api.get('/api/admin/companies').then(data => setCompanies(data.companies || [])).catch(() => toastError("Yuklashda xato"));
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleEdit = (company) => setEditCompany({ ...company });

  const handleSave = async () => {
    try {
      await api.put(`/api/admin/companies/${editCompany.id}`, {
        name: editCompany.name,
        logo: editCompany.logo,
        website: editCompany.website,
        description: editCompany.description
      });
      success("Saqlandi"); setEditCompany(null); loadCompanies();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Kompaniyalar</h1>
        <Link to="/admin/new-company" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>+ Yangi Kompaniya</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {companies.map(c => (
          <div key={c.id} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', textAlign: 'center' }}>
            {c.logo ? <img src={c.logo} alt={c.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }} /> : <div style={{ width: '80px', height: '80px', backgroundColor: '#100b0a', margin: '0 auto 1rem', borderRadius: '8px' }}></div>}
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{c.name}</h3>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>{c.description || 'Tavsif yo\'q'}</p>
            <button onClick={() => handleEdit(c)} style={{ marginTop: '1rem', background: 'none', border: '1px solid #48201a', color: '#f0b44d', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Tahrirlash</button>
          </div>
        ))}
      </div>

      {editCompany && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '500px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Kompaniyani Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Nomi</label>
              <input type="text" value={editCompany.name} onChange={e => setEditCompany({ ...editCompany, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Logotip URL</label>
              <input type="text" value={editCompany.logo} onChange={e => setEditCompany({ ...editCompany, logo: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Veb-sayt</label>
              <input type="url" value={editCompany.website} onChange={e => setEditCompany({ ...editCompany, website: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Tavsif</label>
              <textarea value={editCompany.description} onChange={e => setEditCompany({ ...editCompany, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
              <button onClick={() => setEditCompany(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
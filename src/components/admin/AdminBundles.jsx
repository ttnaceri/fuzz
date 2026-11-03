import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [editBundle, setEditBundle] = useState(null);
  const { success, error: toastError } = useToast();

  const loadBundles = () => {
    api.get('/api/admin/bundles').then(data => setBundles(data.bundles || [])).catch(() => toastError("Yuklashda xato"));
  };

  useEffect(() => { loadBundles(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bundle'ni o'chirishni tasdiqlaysizmi?")) return;
    try { await api.delete(`/api/admin/bundles/${id}`); success("O'chirildi"); loadBundles(); } catch { toastError("Xato"); }
  };

  const handleEdit = (bundle) => setEditBundle({ ...bundle });

  const handleSave = async () => {
    try {
      await api.put(`/api/admin/bundles/${editBundle.id}`, {
        name: editBundle.name,
        description: editBundle.description,
        image: editBundle.image,
        price: editBundle.price,
        discount: editBundle.discount
      });
      success("Saqlandi"); setEditBundle(null); loadBundles();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Bundle'lar</h1>
        <Link to="/admin/new-bundle" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>+ Yangi Bundle</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {bundles.map(b => (
          <div key={b.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
            {b.image && <img src={b.image} alt={b.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{b.name}</h3>
              <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '1rem' }}>{b.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#43b581', fontWeight: 'bold' }}>${b.price}</span>
                <span style={{ color: '#f0b44d' }}>{b.discount > 0 ? `-${b.discount}%` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => handleEdit(b)} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#f0b44d', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>Tahrirlash</button>
                <button onClick={() => handleDelete(b.id)} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#ed5555', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>O'chirish</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editBundle && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '500px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Bundle'ni Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Nomi</label>
              <input type="text" value={editBundle.name} onChange={e => setEditBundle({ ...editBundle, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Narxi ($)</label>
                <input type="number" value={editBundle.price} onChange={e => setEditBundle({ ...editBundle, price: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Chegirma (%)</label>
                <input type="number" value={editBundle.discount} onChange={e => setEditBundle({ ...editBundle, discount: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Tavsif</label>
              <textarea value={editBundle.description} onChange={e => setEditBundle({ ...editBundle, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
              <button onClick={() => setEditBundle(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
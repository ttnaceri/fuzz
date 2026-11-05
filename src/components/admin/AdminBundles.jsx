import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [editBundle, setEditBundle] = useState(null);
  const [bundleGames, setBundleGames] = useState({}); // { bundleId: [games] }
  const { success, error: toastError } = useToast();

  const loadBundles = async () => {
    try {
      const data = await api.get('/api/admin/bundles');
      setBundles(data.bundles || []);
      
      // Har bir bundle uchun o'yinlarni yuklash
      const gamesMap = {};
      for (const b of data.bundles || []) {
        try {
          const res = await api.get(`/api/admin/bundles/${b.id}/games`);
          gamesMap[b.id] = res.games || [];
        } catch { gamesMap[b.id] = []; }
      }
      setBundleGames(gamesMap);
    } catch { toastError("Yuklashda xato"); }
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
        {bundles.map(b => {
          const games = bundleGames[b.id] || [];
          return (
            <div key={b.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
              
              {/* Rasm yoki CDN icon */}
              {b.image ? (
                <img src={b.image} alt={b.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a' }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#8a1200' }}></i>
                </div>
              )}

              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{b.name}</h3>
                <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '1rem' }}>{b.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#43b581', fontWeight: 'bold' }}>${b.price}</span>
                  <span style={{ color: '#f0b44d' }}>{b.discount > 0 ? `-${b.discount}%` : ''}</span>
                </div>

                {/* Bundle ichidagi o'yinlar rasmlari */}
                {games.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #48201a', paddingTop: '0.75rem' }}>
                    <div style={{ color: '#b9a6a2', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Ichidagi o'yinlar:</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {games.map(g => (
                        <Link key={g.id} to={`/game/${g.id}`} title={g.title}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #48201a' }}>
                            {g.image ? (
                              <img src={g.image} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', backgroundColor: '#100b0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-gamepad" style={{ color: '#48201a', fontSize: '0.8rem' }}></i>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => handleEdit(b)} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#f0b44d', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>Tahrirlash</button>
                  <button onClick={() => handleDelete(b.id)} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#ed5555', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>O'chirish</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tahrirlash modali (oldingidek) */}
      {editBundle && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '500px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Bundle'ni Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nomi</label>
              <input type="text" value={editBundle.name} onChange={e => setEditBundle({...editBundle, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Narxi ($)</label>
                <input type="number" value={editBundle.price} onChange={e => setEditBundle({...editBundle, price: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Chegirma (%)</label>
                <input type="number" value={editBundle.discount} onChange={e => setEditBundle({...editBundle, discount: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Tavsif</label>
              <textarea value={editBundle.description} onChange={e => setEditBundle({...editBundle, description: e.target.value})} rows="3" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}></textarea>
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
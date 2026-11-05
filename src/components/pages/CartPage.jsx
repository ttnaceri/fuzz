import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';

export default function CartPage() {
  const { items, removeItem, clear, subtotal } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bundleGamesMap, setBundleGamesMap] = useState({}); // { bundleId: [games] }

  // Bundle'lardagi o'yinlarni yuklash
  useEffect(() => {
    const loadBundleGames = async () => {
      const map = {};
      for (const item of items) {
        if (item.isBundle) {
          try {
            const res = await api.get(`/api/bundles/${item.id}/games`);
            map[item.id] = res.games || [];
          } catch { map[item.id] = []; }
        }
      }
      setBundleGamesMap(map);
    };
    if (items.length > 0) loadBundleGames();
  }, [items]);

  const handleCheckout = async () => {
    if (!user) {
      toastError("Xarid qilish uchun tizimga kiring!");
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Hozircha faqat o'yinlar uchun (bundle ham shu yerga qo'shilishi mumkin)
      for (const item of items) {
        if (!item.isBundle) {
          await api.post('/api/store/buy', { userId: user.id, gameId: item.id });
        }
      }
      success("Barcha o'yinlar muvaffaqiyatli sotib olindi!");
      clear();
      navigate('/library');
    } catch (err) {
      toastError(err.message || "Xarid qilishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 className="page-title" style={{ color: '#f5eeee' }}>Savat</h1>
        <p style={{ color: '#b9a6a2' }}>Savatingiz bo'sh.</p>
        <Link to="/store" className="btn btn-primary mt-2">Do'konga o'tish</Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1 className="page-title" style={{ color: '#f5eeee' }}>Savat</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        {items.map((item) => {
          const games = bundleGamesMap[item.id] || [];
          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Rasm yoki CDN icon */}
                {item.image ? (
                  <img src={item.image} alt={item.title} style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <div style={{ width: 100, height: 56, backgroundColor: '#100b0a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={item.isBundle ? 'fa-solid fa-box-open' : 'fa-solid fa-gamepad'} style={{ color: '#8a1200', fontSize: '1.5rem' }}></i>
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <Link to={item.isBundle ? `/bundle/${item.id}` : `/game/${item.id}`} style={{ color: '#f5eeee', textDecoration: 'none', fontWeight: 'bold' }}>{item.title}</Link>
                  <div style={{ color: '#43b581', fontWeight: 'bold' }}>${item.price}</div>
                </div>
                
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              {/* Bundle ichidagi o'yinlar rasmlari */}
              {item.isBundle && games.length > 0 && (
                <div style={{ paddingLeft: 'calc(100px + 1rem)', borderTop: '1px solid #48201a', paddingTop: '0.5rem' }}>
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
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginTop: '1rem' }}>
          <div style={{ color: '#f5eeee', fontSize: '1.2rem' }}>
            <strong>Jami:</strong> <span style={{ color: '#43b581' }}>{formatPrice(subtotal)}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={loading}
            style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem 2rem', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            {loading ? 'Sotib olinmoqda...' : 'Sotib olish'}
          </button>
        </div>
      </div>
    </div>
  );
}
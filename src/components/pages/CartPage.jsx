import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function CartPage() {
  const { items, removeItem, clear, subtotal } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toastError("Xarid qilish uchun tizimga kiring!");
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      for (const item of items) {
        await api.post('/api/store/buy', { userId: user.id, gameId: item.id });
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
        {items.map((i) => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
            {i.image && <img src={i.image} alt={i.title} style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 4 }} />}
            <div style={{ flex: 1 }}>
              <Link to={`/game/${i.id}`} style={{ color: '#f5eeee', textDecoration: 'none', fontWeight: 'bold' }}>{i.title}</Link>
              <div style={{ color: '#43b581', fontWeight: 'bold' }}>${i.price}</div>
            </div>
            <button onClick={() => removeItem(i.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginTop: '1rem' }}>
          <div style={{ color: '#f5eeee', fontSize: '1.2rem' }}>
            <strong>Jami:</strong> <span style={{ color: '#43b581' }}>${subtotal.toFixed(2)}</span>
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
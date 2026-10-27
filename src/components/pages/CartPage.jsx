import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import EmptyState from '../common/EmptyState.jsx';
import { formatPrice } from '../utils/formatters.js';
import { api } from '../services/api.js';
import { cartService } from '../services/cartService.js';
import useToast from '../hooks/useToast.js';

export default function CartPage() {
  const { items, removeItem, clear, subtotal } = useCart();
  const { success, error: toastError } = useToast();
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    if (!api.isConfigured()) {
      toastError('Checkout requires a configured backend.');
      return;
    }
    setBusy(true);
    try {
      await cartService.checkout();
      clear();
      success('Purchase completed');
    } catch (err) {
      toastError(err.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Cart</h1>
        <EmptyState icon="fa-cart-shopping" title="Cart is empty" message="Add games from the store." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Cart</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {items.map((i) => (
          <div key={i.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {i.image && <img src={i.image} alt="" style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 6 }} />}
            <div style={{ flex: 1 }}>
              <Link to={`/game/${i.id}`}><strong>{i.title}</strong></Link>
              <div className="text-muted">{formatPrice(i.price)}</div>
            </div>
            <button className="btn btn-ghost" onClick={() => removeItem(i.id)} aria-label="Remove">
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ))}
        <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><strong>Subtotal:</strong> {formatPrice(subtotal)}</div>
          <button className="btn btn-primary" onClick={checkout} disabled={busy}>
            {busy ? 'Processing…' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
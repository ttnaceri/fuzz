import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import { formatPrice } from '../../utils/formatters.js';

export default function CartPage() {
  const { items, removeItem, clear, total } = useCart();
  const { t } = useLanguage();

  return (
    <div className="page">
      <h1 className="page-title">{t('cart.title')}</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: '3rem', color: '#48201a' }}></i>
          <h3 style={{ color: '#f5eeee', marginTop: '1rem' }}>{t('cart.empty')}</h3>
          <p style={{ color: '#b9a6a2' }}>{t('cart.emptySub')}</p>
          <Link to="/store" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('nav.store')}</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {items.map(item => (
              <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#f5eeee', margin: 0 }}>{item.title}</h3>
                  <p style={{ color: '#b9a6a2', margin: 0 }}>{formatPrice(item.price)}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="btn btn-secondary btn-sm">{t('cart.remove')}</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#b9a6a2', fontSize: '0.85rem' }}>{t('cart.total')}</div>
              <div style={{ color: '#43b581', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(total)}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={clear} className="btn btn-secondary">{t('cart.clear')}</button>
              <button className="btn btn-primary">{t('cart.checkout')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
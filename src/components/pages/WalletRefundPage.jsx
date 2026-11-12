import { useState } from 'react';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';

export default function WalletRefundPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = amount.replace(/\s/g, '');
    if (!clean || Number(clean) <= 0) return toastError(t('wallet.notEnoughBalance'));

    setLoading(true);
    try {
      await api.post('/api/payment-request', { amount_uzs: Number(clean), method: 'refund' });
      success(t('refund.success'));
      setAmount('');
    } catch (err) {
      toastError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, padding: '1.5rem' }}>
          <h1 className="page-title">{t('refund.title')}</h1>
          <div className="unavailable-notice">{t('wallet.loginRequired')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('refund.title')}</h1>

        <div className="card" style={{ padding: '1.5rem', maxWidth: '500px' }}>
          <p style={{ color: '#b9a6a2', marginBottom: '1rem' }}>{t('refund.rule')}</p>
          <p style={{ color: '#43b581', marginBottom: '1.5rem' }}>{t('wallet.currentBalance')}: <strong>${user.balance?.toFixed(2)}</strong></p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('refund.amount')} (UZS)</label>
              <input type="text" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))} placeholder="50 000" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? '...' : t('refund.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
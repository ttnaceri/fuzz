import { useState } from 'react';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import useToast from '../hooks/useToast.js';

export default function WalletTopUpPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { info, success } = useToast();
  const [amount, setAmount] = useState('');

  const handleTopUp = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      info("Iltimos, to'g'ri miqdor kiriting.");
      return;
    }
    success("So'rov yuborildi! Admin tasdiqlagach balansingiz to'ladi.");
    setAmount('');
  };

  if (!isAuthenticated) {
    return (
      <div className="with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, padding: '1.5rem' }}>
          <h1 className="page-title">{t('wallet.topUp')}</h1>
          <div className="unavailable-notice">{t('wallet.loginRequired')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('wallet.topUp')}</h1>
        
        <div className="card" style={{ padding: '1.5rem', maxWidth: '500px' }}>
          <div className="unavailable-notice" style={{ marginBottom: '1rem' }}>
            <i className="fa-solid fa-clock"></i> {t('wallet.paymentSoon')}
          </div>
          
          <p className="text-muted mb-2">{t('wallet.topUpInfo')}</p>

          <form onSubmit={handleTopUp}>
            <div className="form-group">
              <label className="form-label">{t('wallet.amount')} (UZS)</label>
              <input 
                type="number" 
                className="form-input" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="50,000"
              />
            </div>
            <button type="submit" className="btn btn-primary">{t('wallet.submit')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
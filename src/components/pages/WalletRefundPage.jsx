import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import useToast from '../hooks/useToast.js';

export default function WalletRefundPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  // Demo balans (keyinchalik backenddan olinadi). Hozircha 0.
  const balanceUZS = 0; 
  const canRefund = balanceUZS >= 50000;

  const handleRefund = () => {
    if (!canRefund) {
      toastError(t('wallet.notEnoughBalance'));
      return;
    }
    success(t('wallet.refundSuccess'));
  };

  if (!isAuthenticated) {
    return (
      <div className="with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, padding: '1.5rem' }}>
          <h1 className="page-title">{t('wallet.refund')}</h1>
          <div className="unavailable-notice">{t('wallet.loginRequired')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('wallet.refund')}</h1>
        
        <div className="card" style={{ padding: '1.5rem', maxWidth: '500px' }}>
          <p className="text-muted mb-2">{t('wallet.refundRule')}</p>
          <p><strong>{t('wallet.currentBalance')}:</strong> {balanceUZS.toLocaleString()} UZS</p>

          <button 
            className="btn btn-primary" 
            onClick={handleRefund}
            disabled={!canRefund}
            style={{ marginTop: '1rem', opacity: canRefund ? 1 : 0.5 }}
          >
            {t('wallet.refund')}
          </button>
        </div>
      </div>
    </div>
  );
}
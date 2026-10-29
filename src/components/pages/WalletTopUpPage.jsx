import { useState, useEffect } from 'react';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import useToast from '../hooks/useToast.js';
import { config } from '../config/config.js';

export default function WalletTopUpPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { info, success } = useToast();
  
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(12500); // Zaxira kurs
  const [copied, setCopied] = useState(false);

  // API orqali kursni olish
  useEffect(() => {
    fetch(config.payment.exchangeApiUrl)
      .then(res => res.json())
      .then(data => {
        if (data?.conversion_rates?.UZS) {
          setRate(data.conversion_rates.UZS);
        }
      })
      .catch(err => console.warn("Kursni olishda xatolik:", err));
  }, []);

  const handleTopUp = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      info("Iltimos, to'g'ri miqdor kiriting.");
      return;
    }
    success("So'rov yuborildi! Admin tasdiqlagach balansingiz to'ladi.");
    setAmount('');
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(config.payment.cardNumber.replace(/\s/g, ''));
    setCopied(true);
    info("Karta raqami nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Kiritilgan so'mni dollarga aylantirish
  const amountInUsd = amount ? (Number(amount) / rate).toFixed(2) : '0.00';

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
        
        <div className="card" style={{ padding: '1.5rem', maxWidth: '600px' }}>
          <div className="unavailable-notice" style={{ marginBottom: '1rem' }}>
            <i className="fa-solid fa-clock"></i> {t('wallet.paymentSoon')}
          </div>
          
          <p className="text-muted mb-2">{t('wallet.topUpInfo')}</p>

          {/* Karta ma'lumotlari */}
          <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Karta raqami:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>
                {config.payment.cardNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{config.payment.cardHolder}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyCardNumber}>
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
          </div>

          {/* Hisob-kitob qismi */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">{t('wallet.amount')} (UZS)</label>
              <input 
                type="number" 
                className="form-input" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="50,000"
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center', paddingTop: '1rem' }}>
              <i className="fa-solid fa-arrow-right"></i>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Olinadi (USD)</label>
              <input 
                type="text" 
                className="form-input" 
                value={`$${amountInUsd}`}
                readOnly
                style={{ background: 'var(--color-bg)', cursor: 'not-allowed' }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'right' }}>
            Joriy kurs: 1 USD = {rate.toLocaleString()} UZS
          </div>

          <button className="btn btn-primary" onClick={handleTopUp} style={{ width: '100%' }}>
            {t('wallet.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
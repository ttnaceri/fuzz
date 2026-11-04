import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import useToast from '../hooks/useToast.js';
import Modal from '../common/Modal.jsx';

export default function WalletTopUpPage() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const { info, success } = useToast();
  
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(12500);
  const [copied, setCopied] = useState(false);
  
  // Stars to'lov uchun
  const [starsRates, setStarsRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null); // Tanlangan kurs ($1 = X Stars)
  const [usdAmount, setUsdAmount] = useState('');
  const [starsAmount, setStarsAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(config.payment.exchangeApiUrl)
      .then(res => res.json())
      .then(data => { if (data?.conversion_rates?.UZS) setRate(data.conversion_rates.UZS); })
      .catch(() => {});

    // Stars kurslarini yuklash
    api.get('/api/admin/stars-rates')
      .then(data => {
        setStarsRates(data.rates || []);
        if (data.rates?.length > 0) setSelectedRate(data.rates[0]); // Birinchi kursni tanlash
      })
      .catch(() => {});
  }, []);

  // USD -> Stars hisoblash
  const handleUsdChange = (val) => {
    setUsdAmount(val);
    if (selectedRate && val) {
      const stars = Math.ceil(parseFloat(val) * (selectedRate.stars_amount / selectedRate.amount_usd));
      setStarsAmount(stars > 0 ? stars.toString() : '');
    } else {
      setStarsAmount('');
    }
  };

  // Stars -> USD hisoblash
  const handleStarsChange = (val) => {
    setStarsAmount(val);
    if (selectedRate && val) {
      const usd = (parseInt(val) / (selectedRate.stars_amount / selectedRate.amount_usd)).toFixed(2);
      setUsdAmount(usd > 0 ? usd : '');
    } else {
      setUsdAmount('');
    }
  };

  const handleAmountChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setAmount(''); return; }
    let formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAmount(formatted);
  };

  const handleTopUp = (e) => {
    e.preventDefault();
    const cleanAmount = amount.replace(/\s/g, '');
    if (!cleanAmount || Number(cleanAmount) <= 0) {
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

  // Stars to'lovni boshlash
  const handleStarsPay = () => {
    if (!selectedRate || !usdAmount || !starsAmount || !user) return;
    const botUrl = `https://t.me/FuzzAppBot?start=pay_${usdAmount}_${starsAmount}`;
    window.open(botUrl, '_blank');
    setIsModalOpen(false);
    info("Telegram botga o'ting va to'lovni tasdiqlang.");
  };

  const cleanAmount = amount.replace(/\s/g, '');
  const amountInUsd = cleanAmount ? (Number(cleanAmount) / rate).toFixed(2) : '0.00';

  if (!user) {
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* 1. Karta orqali to'lov */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Karta orqali to'ldirish</h3>
            <div className="unavailable-notice" style={{ marginBottom: '1rem' }}>
              <i className="fa-solid fa-clock"></i> {t('wallet.paymentSoon')}
            </div>
            
            <p className="text-muted mb-2">{t('wallet.topUpInfo')}</p>

            <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Karta raqami:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{config.payment.cardNumber}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{config.payment.cardHolder}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={copyCardNumber}>
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('wallet.amount')} (UZS)</label>
                <input type="text" className="form-input" value={amount} onChange={handleAmountChange} placeholder="50 000" />
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingTop: '1rem' }}><i className="fa-solid fa-arrow-right"></i></div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Olinadi (USD)</label>
                <input type="text" className="form-input" value={`$${amountInUsd}`} readOnly style={{ background: 'var(--color-bg)', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'right' }}>
              Joriy kurs: 1 USD = {rate.toLocaleString()} UZS
            </div>
            <button className="btn btn-primary" onClick={handleTopUp} style={{ width: '100%' }}>
              {t('wallet.submit')}
            </button>
          </div>

          {/* 2. Telegram Stars orqali to'lov (Dinamik) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Telegram Stars orqali to'ldirish</h3>
            <p className="text-muted mb-2">O'zingiz xohlagan miqdorda $ sotib oling (minimal 1 Stars).</p>
            
            {starsRates.length === 0 ? (
              <div style={{ color: '#b9a6a2', fontSize: '0.9rem', marginTop: '1rem' }}>
                Hozircha Stars kurslari mavjud emas.
              </div>
            ) : (
              <div>
                {/* Kursni tanlash */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Kursni tanlang</label>
                  <select 
                    value={starsRates.findIndex(r => r.id === selectedRate?.id)}
                    onChange={(e) => setSelectedRate(starsRates[e.target.value])}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}
                  >
                    {starsRates.map((r, idx) => (
                      <option key={r.id} value={idx}>${r.amount_usd} = {r.stars_amount} Stars</option>
                    ))}
                  </select>
                </div>

                {/* Miqdorni kiritish */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Fuzz Balans ($)</label>
                    <input 
                      type="number" step="0.01" min="0.01" 
                      className="form-input" 
                      value={usdAmount} 
                      onChange={(e) => handleUsdChange(e.target.value)} 
                      placeholder="1.00" 
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', paddingTop: '1rem' }}><i className="fa-solid fa-arrow-right"></i></div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Telegram Stars</label>
                    <input 
                      type="number" min="1" 
                      className="form-input" 
                      value={starsAmount} 
                      onChange={(e) => handleStarsChange(e.target.value)} 
                      placeholder="10" 
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#b9a6a2', marginBottom: '1.5rem', textAlign: 'right' }}>
                  Joriy kurs: ${selectedRate?.amount_usd} = {selectedRate?.stars_amount} Stars
                </div>

                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: '100%' }} disabled={!usdAmount || !starsAmount || parseFloat(usdAmount) <= 0 || parseInt(starsAmount) < 1}>
                  Telegram Stars orqali to'lash
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} title="Telegram Stars orqali to'lov" onClose={() => setIsModalOpen(false)}>
          {selectedRate && (
            <div>
              <p style={{ color: '#f5eeee', marginBottom: '1rem' }}>
                Siz <strong>${usdAmount}</strong> Fuzz balansini <strong>{starsAmount} Stars</strong> evaziga sotib olmoqchisiz.
              </p>
              <p style={{ color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Telegram bot ochiladi va to'lovni tasdiqlaysiz.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Bekor qilish</button>
                <button className="btn btn-primary" onClick={handleStarsPay} style={{ flex: 1 }}>
                  Telegramga o'tish
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
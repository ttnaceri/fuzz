import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import useLanguage from '../context/useLanguage.js';
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
  const [selectedStars, setSelectedStars] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch(config.payment.exchangeApiUrl)
      .then(res => res.json())
      .then(data => { if (data?.conversion_rates?.UZS) setRate(data.conversion_rates.UZS); })
      .catch(() => {});

    // Stars kurslarini yuklash
    api.get('/api/admin/stars-rates')
      .then(data => setStarsRates(data.rates || []))
      .catch(() => {});
  }, []);

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

  // Stars orqali to'lov qilish
  const handleStarsPay = async () => {
    if (!selectedStars || !user) return;
    setProcessing(true);
    try {
      await api.post('/api/store/pay-stars', {
        userId: user.id,
        amount_usd: selectedStars.amount_usd,
        stars_paid: selectedStars.stars_amount
      });
      
      success(`To'lov muvaffaqiyatli! Balansingiz +$${selectedStars.amount_usd} ga oshdi.`);
      setIsModalOpen(false);
      refreshUser(); // Balansni yangilash
    } catch (err) {
      info(err.message || "To'lovda xatolik");
    } finally {
      setProcessing(false);
    }
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

          {/* 2. Telegram Stars orqali to'lov */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Telegram Stars orqali to'ldirish</h3>
            <p className="text-muted mb-2">Telegram Stars yordamida tez va oson to'ldiring.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {starsRates.map(sr => (
                <div 
                  key={sr.id} 
                  onClick={() => { setSelectedStars(sr); setIsModalOpen(true); }}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', backgroundColor: '#100b0a', border: '1px solid #48201a', 
                    borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8a1200'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#48201a'}
                >
                  <div>
                    <div style={{ color: '#43b581', fontWeight: 'bold', fontSize: '1.2rem' }}>${sr.amount_usd}</div>
                    <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Fuzz Balans</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f0b44d', fontWeight: 'bold', fontSize: '1.2rem' }}>{sr.stars_amount} ⭐</div>
                    <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Stars</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal open={isModalOpen} title="Telegram Stars orqali to'lov" onClose={() => setIsModalOpen(false)}>
          {selectedStars && (
            <div>
              <p style={{ color: '#f5eeee', marginBottom: '1rem' }}>
                Siz <strong>${selectedStars.amount_usd}</strong> Fuzz balansini <strong>{selectedStars.stars_amount} Stars</strong> evaziga sotib olmoqchisiz.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Bekor qilish</button>
                <button className="btn btn-primary" onClick={handleStarsPay} disabled={processing} style={{ flex: 1 }}>
                  {processing ? 'Yuborilmoqda...' : 'To\'lash'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
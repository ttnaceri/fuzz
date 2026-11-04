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
  const { user } = useAuth();
  const { info, success } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [rate, setRate] = useState(12500);
  const [amount, setAmount] = useState('');
  
  // Stars
  const [starsRates, setStarsRates] = useState([]);
  const [usdAmount, setUsdAmount] = useState('');
  const [starsAmount, setStarsAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(config.payment.exchangeApiUrl)
      .then(res => res.json())
      .then(data => { if (data?.conversion_rates?.UZS) setRate(data.conversion_rates.UZS); })
      .catch(() => {});

    // To'lov usullarini yuklash
    api.get('/api/payment-methods')
      .then(data => setPaymentMethods(data.methods || []))
      .catch(() => {});

    // Stars kurslarini yuklash
    api.get('/api/admin/stars-rates')
      .then(data => setStarsRates(data.rates || []))
      .catch(() => {});
  }, []);

  const handleStarsPay = () => {
    if (!selectedMethod || selectedMethod.id !== 'stars') return;
    if (!usdAmount || !starsAmount || !user) return;
    const botUrl = `https://t.me/FuzzAppBot?start=pay_${usdAmount}_${starsAmount}`;
    window.open(botUrl, '_blank');
    setIsModalOpen(false);
    info("Telegram botga o'ting va to'lovni tasdiqlang.");
  };

  const handleCardPay = () => {
    const cleanAmount = amount.replace(/\s/g, '');
    if (!cleanAmount || Number(cleanAmount) <= 0) {
      info("Iltimos, to'g'ri miqdor kiriting.");
      return;
    }
    success("So'rov yuborildi! Admin tasdiqlagach balansingiz to'ladi.");
    setAmount('');
    setSelectedMethod(null);
  };

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
        <p style={{ color: '#b9a6a2', marginBottom: '1.5rem' }}>{t('wallet.topUpInfo')}</p>
        
        {!selectedMethod ? (
          // To'lov usullari ro'yxati
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {paymentMethods.map(m => (
              <div 
                key={m.id}
                onClick={() => m.enabled ? setSelectedMethod(m) : null}
                style={{
                  backgroundColor: '#241411',
                  border: '1px solid #48201a',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: m.enabled ? 'pointer' : 'not-allowed',
                  opacity: m.enabled ? 1 : 0.5,
                  position: 'relative',
                  transition: 'transform 0.2s, border-color 0.2s',
                  borderColor: selectedMethod?.id === m.id ? '#8a1200' : '#48201a'
                }}
                onMouseEnter={(e) => m.enabled && (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => m.enabled && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {!m.enabled && (
                  <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#ed5555', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {t('wallet.soon')}
                  </div>
                )}
                {m.discount > 0 && (
                  <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    -{m.discount}%
                  </div>
                )}
                <img src={m.logo_url} alt={m.name} style={{ height: '50px', objectFit: 'contain', marginBottom: '1rem' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                <div style={{ color: '#f5eeee', fontWeight: 'bold' }}>{m.name}</div>
              </div>
            ))}
          </div>
        ) : (
          // Tanlangan to'lov usuli
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => setSelectedMethod(null)} style={{ background: 'none', border: 'none', color: '#b9a6a2', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
              <i className="fa-solid fa-arrow-left"></i> Orqaga
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={selectedMethod.logo_url} alt={selectedMethod.name} style={{ height: '40px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
              <h3 style={{ color: '#f5eeee', margin: 0 }}>{selectedMethod.name}</h3>
              {selectedMethod.discount > 0 && (
                <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>-{selectedMethod.discount}% chegirma</span>
              )}
            </div>

            {selectedMethod.id === 'stars' && (
              <div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Kursni tanlang</label>
                  <select 
                    onChange={(e) => {
                      const r = starsRates[e.target.value];
                      setUsdAmount(r.amount_usd.toString());
                      setStarsAmount(r.stars_amount.toString());
                    }}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}
                  >
                    {starsRates.map((r, idx) => (
                      <option key={r.id} value={idx}>${r.amount_usd} = {r.stars_amount} Stars</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Fuzz Balans ($)</label>
                    <input type="number" className="form-input" value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)} placeholder="1.00" />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', paddingTop: '1.8rem' }}><i className="fa-solid fa-arrow-right"></i></div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Telegram Stars</label>
                    <input type="number" className="form-input" value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} placeholder="10" />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleStarsPay} style={{ width: '100%' }}>
                  Telegram Stars orqali to'lash
                </button>
              </div>
            )}

            {selectedMethod.id === 'card' && (
              <div>
                <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2' }}>Karta raqami:</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{config.payment.cardNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2' }}>{config.payment.cardHolder}</div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Miqdor (UZS)</label>
                  <input type="text" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))} placeholder="50 000" />
                </div>
                <button className="btn btn-primary" onClick={handleCardPay} style={{ width: '100%' }}>
                  So'rov yuborish
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stars Modal */}
        <Modal open={isModalOpen} title="Telegram Stars orqali to'lov" onClose={() => setIsModalOpen(false)}>
          {selectedMethod && (
            <div>
              <p style={{ color: '#f5eeee', marginBottom: '1rem' }}>
                Siz <strong>${usdAmount}</strong> Fuzz balansini <strong>{starsAmount} Stars</strong> evaziga sotib olmoqchisiz.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Bekor qilish</button>
                <button className="btn btn-primary" onClick={handleStarsPay} style={{ flex: 1 }}>Telegramga o'tish</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
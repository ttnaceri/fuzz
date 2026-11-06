import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import useToast from '../hooks/useToast.js';

export default function WalletTopUpPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { info, success } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [rate, setRate] = useState(12500);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Valyuta kursini yuklash
    fetch(config.payment.exchangeApiUrl)
      .then(res => res.json())
      .then(data => { if (data?.conversion_rates?.UZS) setRate(data.conversion_rates.UZS); })
      .catch(() => {});

    // To'lov usullarini yuklash
    api.get('/api/payment-methods')
      .then(data => {
        setPaymentMethods(data.methods || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Karta raqamini nusxalash
  const copyCardNumber = () => {
    // Bo'shliqlarni olib tashlab nusxalaymiz
    const cleanNumber = config.payment.cardNumber.replace(/\s/g, '');
    navigator.clipboard.writeText(cleanNumber);
    setCopied(true);
    info("Karta raqami nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardPay = async () => {
    const cleanAmount = amount.replace(/\s/g, '');
    if (!cleanAmount || Number(cleanAmount) <= 0) {
      info("Iltimos, to'g'ri miqdor kiriting.");
      return;
    }

    try {
      // Backendga so'rov yuborish
      await api.post('/api/payment-request', {
        userId: user.id,
        amount_uzs: Number(cleanAmount)
      });
      success("So'rov yuborildi! Admin tasdiqlagach balansingiz to'ladi.");
      setAmount('');
      setSelectedMethod(null);
    } catch (err) {
      info("So'rov yuborishda xato: " + (err.message || "Server xatosi"));
    }
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
        
        {loading ? (
          <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p>
        ) : !selectedMethod ? (
          /* To'lov usullari ro'yxati */
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
                }}
                onMouseEnter={(e) => m.enabled && (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => m.enabled && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {!m.enabled && (
                  <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#ed5555', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {t('wallet.soon')}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', marginBottom: '1rem' }}>
                  <img src={m.logo_url} alt={m.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                
                <div style={{ color: '#f5eeee', fontWeight: 'bold' }}>{m.name}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Tanlangan to'lov usuli (Karta) */
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => setSelectedMethod(null)} style={{ background: 'none', border: 'none', color: '#b9a6a2', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
              <i className="fa-solid fa-arrow-left"></i> Orqaga
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={selectedMethod.logo_url} alt={selectedMethod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <h3 style={{ color: '#f5eeee', margin: 0 }}>{selectedMethod.name}</h3>
            </div>

            {selectedMethod.id === 'card' && (
              <div>
                {/* Karta raqami qismi (Configdan olinadi) */}
                <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2', marginBottom: '0.2rem' }}>Karta raqami:</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px', color: '#f5eeee' }}>
                      {config.payment.cardNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2', marginTop: '0.2rem' }}>
                      {config.payment.cardHolder}
                    </div>
                  </div>
                  
                  {/* Nusxalash tugmasi */}
                  <button 
                    onClick={copyCardNumber}
                    style={{ background: '#100b0a', border: '1px solid #48201a', color: copied ? '#43b581' : '#b9a6a2', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' }}
                    title="Karta raqamini nusxalash"
                  >
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Miqdor (UZS)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))} 
                    placeholder="50 000" 
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#43b581', marginTop: '0.3rem' }}>
                    ≈ ${(Number(amount.replace(/\s/g, '')) / rate).toFixed(2)}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCardPay} style={{ width: '100%', marginTop: '1rem' }}>
                  So'rov yuborish
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
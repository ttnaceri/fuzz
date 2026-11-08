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
  
  // Stars uchun state'lar
  const [starsRates, setStarsRates] = useState([]);
  const [starsUsd, setStarsUsd] = useState('1');
  const [starsAmount, setStarsAmount] = useState(10);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    // Valyuta kursi
    api.get('/rates/usd')
      .then(data => {
        if (data?.usd_uzs && Number(data.usd_uzs) > 0) setRate(Number(data.usd_uzs));
      })
      .catch(() => {});

    // To'lov usullari
    api.get('/payment-methods')
      .then(data => {
        setPaymentMethods(data.methods || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Stars paketlari
    api.get('/stars-rates')
      .then(data => setStarsRates(data.rates || []))
      .catch(() => {});
  }, []);

  const copyCardNumber = () => {
    const cleanNumber = config.payment.cardNumber.replace(/\s/g, '');
    navigator.clipboard.writeText(cleanNumber);
    setCopied(true);
    info("Karta raqami nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Karta orqali to'lov (So'rov yuborish)
  const handleCardPay = async () => {
    const cleanAmount = amount.replace(/\s/g, '');
    if (!cleanAmount || Number(cleanAmount) <= 0) {
      info("Iltimos, to'g'ri miqdor kiriting.");
      return;
    }

    setRequestLoading(true);
    try {
      // Endi userId yuborilmaydi. Backend o'zi JWT orqali aniqlaydi.
      await api.post('/payment-request', { amount_uzs: Number(cleanAmount) });
      success("So'rov yuborildi! Admin tasdiqlagach balansingiz to'ladi.");
      setAmount('');
      setSelectedMethod(null);
    } catch (err) {
      info("So'rov yuborishda xato: " + (err.message || "Server xatosi"));
    } finally {
      setRequestLoading(false);
    }
  };

  // Stars inputlarini bog'lash
  const handleUsdChange = (v) => {
    const clean = v.replace(/[^\d.]/g, '');
    setStarsUsd(clean);
    const usd = parseFloat(clean);
    if (!isNaN(usd) && usd > 0) {
      const exact = starsRates.find(r => Number(r.amount_usd) === usd);
      setStarsAmount(exact ? Number(exact.stars_amount) : Math.max(1, Math.round(usd * 10)));
    } else {
      setStarsAmount(0);
    }
  };

  const handleStarsChange = (v) => {
    const clean = v.replace(/\D/g, '');
    const stars = parseInt(clean, 10) || 0;
    setStarsAmount(stars);
    if (stars >= 1) {
      const exact = starsRates.find(r => Number(r.stars_amount) === stars);
      setStarsUsd(exact ? String(exact.amount_usd) : (stars / 10).toFixed(2));
    } else {
      setStarsUsd('');
    }
  };

  const handleStarsPay = () => {
    const usd = parseFloat(starsUsd);
    if (!usd || usd <= 0) return info('Miqdor kiriting');
    if (!starsAmount || starsAmount < 1) return info('Kamida 1 Star');
    
    // Telegram botga yo'naltirish
    const url = `https://t.me/FuzzAppBot?start=pay_${usd}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    success("Telegram'da to'lovni yakunlang. Balans avtomatik to'ladi.");
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {paymentMethods.map(m => (
              <div
                key={m.id}
                onClick={() => m.enabled ? setSelectedMethod(m) : null}
                style={{
                  backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', padding: '1.5rem', textAlign: 'center',
                  cursor: m.enabled ? 'pointer' : 'not-allowed', opacity: m.enabled ? 1 : 0.5, position: 'relative', transition: 'transform 0.2s',
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
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => { setSelectedMethod(null); setStarsUsd('1'); setStarsAmount(10); }} style={{ background: 'none', border: 'none', color: '#b9a6a2', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
              <i className="fa-solid fa-arrow-left"></i> Orqaga
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={selectedMethod.logo_url} alt={selectedMethod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <h3 style={{ color: '#f5eeee', margin: 0 }}>{selectedMethod.name}</h3>
            </div>

            {/* TELEGRAM STARS */}
            {selectedMethod.id === 'stars' && (
              <div>
                <p style={{ color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '1rem' }}>Balansni Telegram Stars orqali to'ldiring.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Fuzz $</label>
                    <input type="text" className="form-input" value={starsUsd} onChange={(e) => handleUsdChange(e.target.value)} placeholder="1.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telegram Stars</label>
                    <input type="text" className="form-input" value={starsAmount} onChange={(e) => handleStarsChange(e.target.value)} placeholder="10" />
                  </div>
                </div>
                {starsRates.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {starsRates.map(r => (
                      <button key={`${r.amount_usd}-${r.stars_amount}`} type="button" onClick={() => { setStarsUsd(String(r.amount_usd)); setStarsAmount(Number(r.stars_amount)); }}
                        style={{ background: Number(starsUsd) === Number(r.amount_usd) ? '#8a1200' : '#100b0a', border: '1px solid #48201a', color: '#f5eeee', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        ${r.amount_usd} = {r.stars_amount} ⭐
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleStarsPay} style={{ width: '100%', marginTop: '1rem' }}>
                  <i className="fa-brands fa-telegram" style={{ marginRight: '0.5rem' }}></i> Telegram'da to'lash
                </button>
              </div>
            )}

            {/* KARTA */}
            {selectedMethod.id === 'card' && (
              <div>
                <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2', marginBottom: '0.2rem' }}>Karta raqami:</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px', color: '#f5eeee' }}>{config.payment.cardNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: '#b9a6a2', marginTop: '0.2rem' }}>{config.payment.cardHolder}</div>
                  </div>
                  <button onClick={copyCardNumber} style={{ background: '#100b0a', border: '1px solid #48201a', color: copied ? '#43b581' : '#b9a6a2', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }} title="Nusxalash">
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                </div>
                <div className="form-group">
                  <label className="form-label">Miqdor (UZS)</label>
                  <input type="text" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))} placeholder="50 000" />
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#43b581', marginTop: '0.3rem' }}>
                    ≈ ${(Number(amount.replace(/\s/g, '')) / rate).toFixed(2)}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCardPay} disabled={requestLoading} style={{ width: '100%', marginTop: '1rem', opacity: requestLoading ? 0.7 : 1 }}>
                  {requestLoading ? 'Yuborilmoqda...' : "So'rov yuborish"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
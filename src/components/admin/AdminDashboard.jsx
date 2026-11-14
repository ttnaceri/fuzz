import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../context/useLanguage.js';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    users: 0,
    games: 0,
    bundles: 0,
    events: 0,
    totalBalance: 0,   // Userlarning umumiy balansi
    totalStars: 0,     // Jami olingan Stars
    totalStarsUsd: 0,  // Stars orqali kelgan pul ($ da)
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Asosiy statistikani olish (userlar, o'yinlar, UMUMIY BALANS)
    api.get('/api/admin/stats')
      .then(data => { setStats(prev => ({ ...prev, ...data })); setLoading(false); })
      .catch(() => setLoading(false));

    // 2. Stars to'lovlarini ajratib olish (faqat stars_paid > 0)
    api.get('/api/admin/payments')
      .then(data => {
        const payments = data.payments || [];
        const starsPayments = payments.filter(p => Number(p.stars_paid) > 0);
        
        const totalStars = starsPayments.reduce((sum, p) => sum + (Number(p.stars_paid) || 0), 0);
        const totalStarsUsd = starsPayments.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
        
        setStats(prev => ({ ...prev, totalStars, totalStarsUsd }));
      })
      .catch(() => {});
  }, []);

  // Kartochkalar
  const cards = [
    { label: t('admin.totalUsers') || 'Foydalanuvchilar', value: stats.users, icon: 'fa-users', color: '#43b581' },
    { label: t('admin.totalGames') || "O'yinlar", value: stats.games, icon: 'fa-gamepad', color: '#f0b44d' },
    { label: t('admin.totalBundles') || "Bundle'lar", value: stats.bundles, icon: 'fa-box-open', color: '#8a1200' },
    { label: t('admin.totalEvents') || "Eventlar", value: stats.events, icon: 'fa-calendar', color: '#43b581' },
    
    // 1. USERLARNING UMUMIY BALANSI
    { label: 'Umumiy Balans', value: `$${Number(stats.totalBalance || 0).toFixed(2)}`, icon: 'fa-dollar-sign', color: '#43b581' },
    
    // 2. JAMI STARS
    { label: t('admin.totalStars') || 'Jami Stars', value: `${stats.totalStars} ⭐`, icon: 'fa-star', color: '#f0b44d' },
    
    // 3. STARS DAROMADI
    { label: t('admin.starsInDollars') || 'Stars ($ da)', value: `$${Number(stats.totalStarsUsd || 0).toFixed(2)}`, icon: 'fa-money-bill', color: '#43b581' },
  ];

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>{t('admin.dashboard') || 'Boshqaruv paneli'}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>{card.label}</div>
              <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: '1.2rem' }}></i>
            </div>
            <div style={{ color: card.color, fontSize: '2rem', fontWeight: 'bold' }}>
              {loading ? '...' : card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>{t('admin.recentActivity') || "So'nggi harakatlar"}</h3>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
            <p>• Yangi foydalanuvchi ro'yxatdan o'tdi</p>
            <p>• O'yin sotib olindi</p>
            <p>• Yangi event rejalashtirildi</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>{t('admin.quickLinks') || 'Tezkor havolalar'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/admin/users" style={{ color: '#43b581', textDecoration: 'none' }}>
              {t('admin.manageUsers') || 'Foydalanuvchilarni boshqarish'} →
            </Link>
            <Link to="/admin/all-games" style={{ color: '#43b581', textDecoration: 'none' }}>
              {t('admin.manageGames') || "O'yinlarni boshqarish"} →
            </Link>
            <Link to="/admin/companies" style={{ color: '#43b581', textDecoration: 'none' }}>
              {t('admin.manageCompanies') || 'Kompaniyalarni boshqarish'} →
            </Link>
            <Link to="/admin/bundles" style={{ color: '#43b581', textDecoration: 'none' }}>
              {t('admin.manageBundles') || "Bundle'larni boshqarish"} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
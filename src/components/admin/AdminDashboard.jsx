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
    revenue: 0,
    totalStars: 0,
    totalStarsUsd: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(data => { setStats(prev => ({ ...prev, ...data })); setLoading(false); })
      .catch(() => setLoading(false));

    api.get('/api/admin/payments')
      .then(data => {
        const totalStars = data.payments?.reduce((sum, p) => sum + (p.stars_paid || 0), 0) || 0;
        const totalStarsUsd = data.payments?.reduce((sum, p) => sum + (p.amount_usd || 0), 0) || 0;
        setStats(prev => ({ ...prev, totalStars, totalStarsUsd }));
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: t('admin.totalUsers'), value: stats.users, icon: 'fa-users', color: '#43b581' },
    { label: t('admin.totalGames'), value: stats.games, icon: 'fa-gamepad', color: '#f0b44d' },
    { label: t('admin.totalBundles'), value: stats.bundles, icon: 'fa-box-open', color: '#8a1200' },
    { label: t('admin.totalEvents'), value: stats.events, icon: 'fa-calendar', color: '#43b581' },
    { label: t('admin.revenue'), value: `$${Number(stats.revenue || 0).toFixed(2)}`, icon: 'fa-dollar-sign', color: '#43b581' },
    { label: t('admin.totalStars'), value: `${stats.totalStars} ⭐`, icon: 'fa-star', color: '#f0b44d' },
    { label: t('admin.starsInDollars'), value: `$${Number(stats.totalStarsUsd || 0).toFixed(2)}`, icon: 'fa-money-bill', color: '#43b581' },
  ];

  const quickLinks = [
    { to: '/admin/users', label: t('admin.manageUsers') },
    { to: '/admin/all-games', label: t('admin.manageGames') },
    { to: '/admin/companies', label: t('admin.manageCompanies') },
    { to: '/admin/bundles', label: t('admin.manageBundles') },
  ];

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>{t('admin.dashboard')}</h1>

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
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>{t('admin.recentActivity')}</h3>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
            <p>• {t('admin.recentActivity1') || 'Yangi foydalanuvchi ro\'yxatdan o\'tdi'}</p>
            <p>• {t('admin.recentActivity2') || 'O\'yin sotib olindi'}</p>
            <p>• {t('admin.recentActivity3') || 'Yangi event rejalashtirildi'}</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>{t('admin.quickLinks')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickLinks.map((l, idx) => (
              <Link key={idx} to={l.to} style={{ color: '#43b581', textDecoration: 'none' }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
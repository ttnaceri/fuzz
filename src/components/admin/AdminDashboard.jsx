import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, games: 0, bundles: 0, events: 0, revenue: 0, totalStars: 0, totalStarsUsd: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin stats
    api.get('/api/admin/stats')
      .then(data => { setStats(prev => ({ ...prev, ...data })); setLoading(false); })
      .catch(() => setLoading(false));

    // Stars statistikasi
    api.get('/api/admin/payments') // Yangi API (pastda qo'shiladi)
      .then(data => {
        const totalStars = data.payments?.reduce((sum, p) => sum + (p.stars_paid || 0), 0) || 0;
        const totalStarsUsd = data.payments?.reduce((sum, p) => sum + (p.amount_usd || 0), 0) || 0;
        setStats(prev => ({ ...prev, totalStars, totalStarsUsd }));
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Foydalanuvchilar', value: stats.users, icon: 'fa-users', color: '#43b581' },
    { label: 'O\'yinlar', value: stats.games, icon: 'fa-gamepad', color: '#f0b44d' },
    { label: 'Bundle\'lar', value: stats.bundles, icon: 'fa-box-open', color: '#8a1200' },
    { label: 'Eventlar', value: stats.events, icon: 'fa-calendar', color: '#43b581' },
    { label: 'Umumiy Balans', value: `$${stats.revenue}`, icon: 'fa-dollar-sign', color: '#43b581' },
    { label: 'Umumiy Stars', value: `${stats.totalStars} ⭐`, icon: 'fa-star', color: '#f0b44d' },
    { label: 'Stars ($ da)', value: `$${stats.totalStarsUsd.toFixed(2)}`, icon: 'fa-money-bill', color: '#43b581' },
  ];

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Boshqaruv Paneli</h1>
      
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
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>So'nggi harakatlar</h3>
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
            <p>• Yangi foydalanuvchi ro'yxatdan o'tdi</p>
            <p>• O'yin sotib olindi</p>
            <p>• Yangi event rejalashtirildi</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Tezkor havolalar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="/admin/users" style={{ color: '#43b581', textDecoration: 'none' }}>Foydalanuvchilarni boshqarish →</a>
            <a href="/admin/all-games" style={{ color: '#43b581', textDecoration: 'none' }}>O'yinlarni boshqarish →</a>
            <a href="/admin/companies" style={{ color: '#43b581', textDecoration: 'none' }}>Kompaniyalarni boshqarish →</a>
            <a href="/admin/bundles" style={{ color: '#43b581', textDecoration: 'none' }}>Bundle'larni boshqarish →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/games')
      .then(data => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("O'yinlarni yuklashda xato:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>O'yinlar Boshqaruvi</h1>
      <div style={{ padding: '1rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', color: '#b9a6a2' }}>
        {loading ? 'Yuklanmoqda...' : games.length === 0 ? "Hozircha qo'shilgan o'yinlar yo'q. (Yangi o'yin qo'shish bo'limi tez kunda)" : "O'yinlar ro'yxati yuklandi."}
      </div>
    </div>
  );
}
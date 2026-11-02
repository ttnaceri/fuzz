import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import useAuth from '../hooks/useAuth.js';

export default function GamePlayerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameUrl, setGameUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secondsPlayed, setSecondsPlayed] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/games/${id}/play?userId=${user.id}`)
      .then(data => { setGameUrl(data.game_url); setLoading(false); })
      .catch(() => { setError("O'yinni yuklab bo'lmadi."); setLoading(false); });
  }, [id, user, navigate]);

  useEffect(() => {
    if (!gameUrl) return;
    const interval = setInterval(() => setSecondsPlayed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameUrl]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (secondsPlayed > 5) {
        const data = new Blob([JSON.stringify({ userId: user?.id, gameId: id, seconds: secondsPlayed })], { type: 'application/json' });
        // To'g'rilangan URL
        navigator.sendBeacon(`${config.apiBaseUrl}/api/games/track-time`, data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { window.removeEventListener('beforeunload', handleBeforeUnload); handleBeforeUnload(); };
  }, [secondsPlayed, user, id]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>O'yin yuklanmoqda...</div>;
  if (error) return <div style={{ color: '#ed5555', textAlign: 'center', marginTop: '20vh' }}>{error}</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.5rem 1rem', backgroundColor: '#19100e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #48201a' }}>
        <button onClick={() => navigate('/library')} style={{ background: 'none', border: 'none', color: '#b9a6a2', cursor: 'pointer', fontSize: '1rem' }}>
          <i className="fa-solid fa-arrow-left"></i> O'yindan chiqish
        </button>
        <div style={{ color: '#43b581', fontFamily: 'monospace' }}>
          <i className="fa-solid fa-clock"></i> {Math.floor(secondsPlayed / 60)}m {secondsPlayed % 60}s
        </div>
      </div>
      <iframe src={gameUrl} title="Fuzz Web Game" style={{ flex: 1, width: '100%', border: 'none' }} allowFullScreen />
    </div>
  );
}
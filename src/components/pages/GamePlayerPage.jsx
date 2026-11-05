import { useState, useEffect, useRef } from 'react';
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
  const [isBreakMenuOpen, setIsBreakMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Shift + Tab ni ushlash
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setIsBreakMenuOpen(prev => !prev);
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/games/${id}/play?userId=${user.id}`)
      .then(data => { setGameUrl(data.game_url); setLoading(false); })
      .catch(() => { setError("O'yinni yuklab bo'lmadi."); setLoading(false); });
  }, [id, user, navigate]);

  useEffect(() => {
    if (!gameUrl || isPaused || isBreakMenuOpen) return;
    const interval = setInterval(() => setSecondsPlayed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameUrl, isPaused, isBreakMenuOpen]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (secondsPlayed > 5) {
        const data = new Blob([JSON.stringify({ userId: user?.id, gameId: id, seconds: secondsPlayed })], { type: 'application/json' });
        navigator.sendBeacon(`${config.apiBaseUrl}/api/games/track-time`, data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [secondsPlayed, user, id]);

  const handleReturnToFuzz = () => {
    if (secondsPlayed > 5) {
      const data = new Blob([JSON.stringify({ userId: user?.id, gameId: id, seconds: secondsPlayed })], { type: 'application/json' });
      navigator.sendBeacon(`${config.apiBaseUrl}/api/games/track-time`, data);
    }
    navigate('/library');
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh', backgroundColor: '#000', height: '100vh' }}>O'yin yuklanmoqda...</div>;
  if (error) return <div style={{ color: '#ed5555', textAlign: 'center', marginTop: '20vh', backgroundColor: '#000', height: '100vh' }}>{error}</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      
      {isBreakMenuOpen ? (
        <BreakMenu secondsPlayed={secondsPlayed} onReturn={handleReturnToFuzz} onClose={() => { setIsBreakMenuOpen(false); setIsPaused(false); }} />
      ) : (
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Ko'rinmas div: faqat klaviatura hodisalarini ushlab qolish uchun */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              pointerEvents: 'none', // Sichqoncha o'yindan o'tishi uchun
              outline: 'none'
            }}
            tabIndex={-1}
            ref={(el) => el && el.focus()} // Avtomatik fokus olish
          ></div>
          
          <iframe 
            src={gameUrl} 
            title="Fuzz Web Game" 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

function BreakMenu({ secondsPlayed, onReturn, onClose }) {
  return (
    <div style={{ flex: 1, backgroundColor: 'rgba(16, 11, 10, 0.95)', display: 'flex', flexDirection: 'column', padding: '2rem', color: '#f5eeee', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #48201a', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#8a1200' }}>Fuzz Break Menu</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onReturn} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-arrow-left"></i> Fuzz ga qaytish
          </button>
          <button onClick={onClose} style={{ backgroundColor: '#48201a', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-play"></i> Davom Ettirish
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b9a6a2' }}>
        <p>O'yin vaqti: {Math.floor(secondsPlayed / 60)} daqiqa {secondsPlayed % 60} soniya</p>
      </div>
    </div>
  );
}
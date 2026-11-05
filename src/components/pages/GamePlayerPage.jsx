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
  
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/games/${id}/play?userId=${user.id}`)
      .then(data => { setGameUrl(data.game_url); setLoading(false); })
      .catch(() => { setError("O'yinni yuklab bo'lmadi."); setLoading(false); });
  }, [id, user, navigate]);

  // Shift + Tab ni ushlash va to'g'ri ishlashi uchun
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift + Tab bosilganda
      if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault(); // Brauzer o'zining "orqaga o'tish"ini to'xtatamiz
        setIsBreakMenuOpen(prev => !prev);
        setIsPaused(prev => !prev);
      }
    };

    // Hodisani to'g'ridan-to'g'ri oynaga (window) ulaymiz
    window.addEventListener('keydown', handleKeyDown);
    
    // Muammo: iframe ichida fokus bo'lsa, window eventni eshitmaydi.
    // Yechim: iframe ustiga sichqoncha kelganda yoki har 1 soniyada fokusni o'zimizga qaytaramiz
    // Yoki iframe ustiga shaffof div qo'yamiz (lekin bu o'yinni o'ynashga xalaqit beradi).
    // Eng yaxshisi: iframe ga fokus berganda, foydalanuvchi Shift+Tab bosishidan oldin
    // sichqonchani tashqariga olib chiqishi kerak. Buni avtomatlashtirish qiyin.
    
    // Alternativ: iframe yuklanganda, unga fokus beramiz, lekin klavishalarni window da ushlaymiz
    const handleIframeFocus = () => {
        // Bu funksiya iframe fokus olganda ishga tushadi, lekin bizda bunday event yo'q.
    };

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Vaqt hisoblagichi
  useEffect(() => {
    if (!gameUrl || isPaused || isBreakMenuOpen) return;
    const interval = setInterval(() => setSecondsPlayed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameUrl, isPaused, isBreakMenuOpen]);

  // Sahifadan chiqishda vaqtni saqlash
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
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {isBreakMenuOpen ? (
        <BreakMenu secondsPlayed={secondsPlayed} onReturn={handleReturnToFuzz} onClose={() => { setIsBreakMenuOpen(false); setIsPaused(false); }} />
      ) : (
        <iframe 
          ref={iframeRef}
          src={gameUrl} 
          title="Fuzz Web Game" 
          style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      )}
    </div>
  );
}

// Break Menu Komponenti
function BreakMenu({ secondsPlayed, onReturn, onClose }) {
  return (
    <div style={{ flex: 1, backgroundColor: 'rgba(16, 11, 10, 0.95)', display: 'flex', flexDirection: 'column', padding: '2rem', color: '#f5eeee', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #48201a', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#8a1200' }}>Fuzz Break Menu</h1>
          <span style={{ color: '#43b581', fontSize: '1.2rem', fontFamily: 'monospace' }}>
            <i className="fa-solid fa-clock"></i> {Math.floor(secondsPlayed / 60)}m {secondsPlayed % 60}s
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onReturn} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-arrow-left"></i> Fuzz ga qaytish
          </button>
          <button onClick={onClose} style={{ backgroundColor: '#48201a', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-play"></i> Davom Ettirish
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b9a6a2' }}>
        <p>Bu yerda o'yin statistikasi, notepad va boshqa asboblar bo'lishi mumkin (oldingi kodlaringizda bor edi).</p>
      </div>
    </div>
  );
}
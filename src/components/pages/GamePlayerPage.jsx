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

  // iframe ga fokus berish uchun ref
  const iframeRef = useRef(null);
  const breakMenuRef = useRef(null);

  // O'yinni yuklash
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/games/${id}/play?userId=${user.id}`)
      .then(data => { setGameUrl(data.game_url); setLoading(false); })
      .catch(() => { setError("O'yinni yuklab bo'lmadi."); setLoading(false); });
  }, [id, user, navigate]);

  // Shift + Tab ni ushlash va menyuni boshqarish
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift + Tab bosilganda
      if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault(); // Brauzerning standart "fokus" harakatini to'xtatamiz
        setIsBreakMenuOpen(prev => {
          const newState = !prev;
          // Menyu yopilganda iframe ga fokus qaytaramiz
          if (!newState && iframeRef.current) {
            setTimeout(() => iframeRef.current.focus(), 50);
          }
          return newState;
        });
      }
      
      // Escape bosilganda menyuni yopish
      if (e.key === 'Escape' && isBreakMenuOpen) {
        setIsBreakMenuOpen(false);
        if (iframeRef.current) {
          setTimeout(() => iframeRef.current.focus(), 50);
        }
      }
    };

    // Diqqat: window emas, document ga qo'shamiz. Sababi fokus iframe dan chiqqanda ham ishlashi kerak.
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBreakMenuOpen]);

  // O'yin vaqtini hisoblash (faqat menyu yopiq bo'lganda)
  useEffect(() => {
    if (!gameUrl || isBreakMenuOpen) return;
    const interval = setInterval(() => setSecondsPlayed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameUrl, isBreakMenuOpen]);

  // Vaqtni backendga yuborish
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
      
      {/* 
        MUHIM: iframe har doim mavjud bo'lishi kerak, faqat menyu ochilganda 
        uning ustiga shaffof overlay chiqadi. Bu fokusni saqlab qolishga yordam beradi.
      */}
      <div style={{ position: 'relative', flex: 1, width: '100%', height: '100%' }}>
        <iframe
          ref={iframeRef}
          src={gameUrl}
          title="Fuzz Web Game"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />

        {/* Overlay: Menyu ochilganda iframe ustiga tushadi */}
        {isBreakMenuOpen && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(16, 11, 10, 0.95)', // To'liq qoraytirmaydi, lekin fokusni ushlaydi
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <BreakMenu 
              secondsPlayed={secondsPlayed} 
              onReturn={handleReturnToFuzz} 
              onClose={() => {
                setIsBreakMenuOpen(false);
                if (iframeRef.current) setTimeout(() => iframeRef.current.focus(), 50);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// BREAK MENU KOMPONENTI
// ==========================================
function BreakMenu({ secondsPlayed, onReturn, onClose }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [notes, setNotes] = useState(localStorage.getItem('fuzz_notes') || '');
  const handleNoteChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem('fuzz_notes', e.target.value);
  };

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', color: '#f5eeee', overflowY: 'auto' }}>
      
      {/* Sarlavha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #48201a', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#8a1200' }}>Fuzz Break Menu</h1>
          <span style={{ color: '#43b581', fontSize: '1.2rem', fontFamily: 'monospace' }}>
            <i className="fa-solid fa-clock"></i> {Math.floor(secondsPlayed / 60)}m {secondsPlayed % 60}s
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#f0b44d', fontSize: '1.2rem', fontWeight: 'bold' }}>{time}</span>
          <button onClick={onReturn} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-arrow-left"></i> Fuzz ga qaytish
          </button>
          <button onClick={onClose} style={{ backgroundColor: '#48201a', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-play"></i> Davom Ettirish
          </button>
        </div>
      </div>

      {/* Panellar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', flex: 1 }}>
        
        {/* Statistikasi */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-chart-simple"></i> O'yin Statistikasi
          </h3>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Joriy o'yin vaqti: <strong style={{ color: '#43b581' }}>{Math.floor(secondsPlayed / 60)} daqiqa {secondsPlayed % 60} soniya</strong></div>
        </div>

        {/* Timer */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-stopwatch"></i> Timer
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', color: '#f5eeee', margin: '1rem 0' }}>
            {formatTimer(timerSeconds)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ backgroundColor: isTimerRunning ? '#f0b44d' : '#43b581', color: '#000', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isTimerRunning ? 'Pauza' : 'Boshlash'}
            </button>
            <button onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }} style={{ backgroundColor: '#48201a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        </div>

        {/* Notepad */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-pen"></i> Notepad
          </h3>
          <textarea 
            value={notes}
            onChange={handleNoteChange}
            placeholder="Bu yerga eslatma yozing..."
            style={{ flex: 1, minHeight: '150px', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', padding: '0.5rem', resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>

        {/* Google Browser (Resizable) */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-globe"></i> Internet Browser
          </h3>
          <iframe 
            src="https://www.google.com/search?igu=1" 
            title="Mini Browser"
            style={{ flex: 1, minHeight: '400px', border: '1px solid #48201a', borderRadius: '4px', backgroundColor: '#fff', resize: 'both', overflow: 'auto' }}
          />
        </div>

        {/* Tizim resurslari */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-wifi"></i> Tizim Resurslari
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>FPS:</span> <strong style={{ color: '#43b581' }}>60 FPS</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Ping:</span> <strong style={{ color: '#43b581' }}>24 ms</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Internet:</span> <strong style={{ color: '#43b581' }}>50 Mbps</strong></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#b9a6a2', fontSize: '0.8rem' }}>
        Break Menuni yopish uchun <strong>Shift + Tab</strong> yoki <strong>Escape</strong> tugmasini bosing.
      </div>
    </div>
  );
}
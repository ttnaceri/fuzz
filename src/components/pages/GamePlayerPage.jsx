import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import useAuth from '../hooks/useAuth.js';

// ==========================================
// BREAK MENU KOMPONENTI (Yordamchi)
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
    <div style={{ color: '#f5eeee' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Statistikasi */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-chart-simple"></i> O'yin Statistikasi
          </h3>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Joriy o'yin vaqti: <strong style={{ color: '#43b581' }}>{Math.floor(secondsPlayed / 60)} daqiqa {secondsPlayed % 60} soniya</strong>
          </div>
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

        {/* Internet Browser */}
        <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#b9a6a2', fontSize: '1rem', textTransform: 'uppercase' }}>
            <i className="fa-solid fa-globe"></i> Internet Browser
          </h3>
          <iframe
            src="https://www.google.com/search?igu=1"
            title="Mini Browser"
            style={{ flex: 1, minHeight: '400px', border: '1px solid #48201a', borderRadius: '4px', backgroundColor: '#fff' }}
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

// ==========================================
// ASOSIY GAME PLAYER PAGE (Export default shu yerda)
// ==========================================
export default function GamePlayerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gameUrl, setGameUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secondsPlayed, setSecondsPlayed] = useState(0);
  const [isBreakMenuOpen, setIsBreakMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeRef = useRef(null);
  const gameContainerRef = useRef(null);

  // 1. O'yinni yuklash
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/games/${id}/play`)
      .then(data => { setGameUrl(data.game_url); setLoading(false); })
      .catch(() => { setError("O'yinni yuklab bo'lmadi."); setLoading(false); });
  }, [id, user, navigate]);

  // 2. Klavishlarni ushlash (Shift+Tab, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setIsBreakMenuOpen(prev => !prev);
        if (isBreakMenuOpen) {
          setTimeout(() => iframeRef.current?.focus(), 50);
        }
      }
      if (e.key === 'Escape' && isBreakMenuOpen) {
        setIsBreakMenuOpen(false);
        setTimeout(() => iframeRef.current?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBreakMenuOpen]);

  // 3. Playtime hisoblash (faqat menyu yopiq bo'lsa)
  useEffect(() => {
    if (!gameUrl || isBreakMenuOpen) return;
    const interval = setInterval(() => setSecondsPlayed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameUrl, isBreakMenuOpen]);

  // 4. Vaqtni backendga yuborish (sahifa yopilganda)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (secondsPlayed > 5) {
        const data = new Blob([JSON.stringify({ gameId: id, seconds: secondsPlayed })], { type: 'application/json' });
        navigator.sendBeacon(`${config.apiBaseUrl}/api/games/track-time`, data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [secondsPlayed, id]);

  // 5. Fullscreen tugmasi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 6. Reload tugmasi
  const reloadGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // 7. Back tugmasi
  const handleReturn = () => {
    if (secondsPlayed > 5) {
      const data = new Blob([JSON.stringify({ gameId: id, seconds: secondsPlayed })], { type: 'application/json' });
      navigator.sendBeacon(`${config.apiBaseUrl}/api/games/track-time`, data);
    }
    if (document.fullscreenElement) document.exitFullscreen();
    navigate('/library');
  };

  // 8. Fokus berish
  const focusGame = () => {
    setTimeout(() => {
      window.focus();
    }, 100);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh', backgroundColor: '#000', height: '100vh' }}>O'yin yuklanmoqda...</div>;
  if (error) return <div style={{ color: '#ed5555', textAlign: 'center', marginTop: '20vh', backgroundColor: '#000', height: '100vh' }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#100b0a', display: 'flex', flexDirection: 'column', padding: '1rem' }}>

      {/* Tepa panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={handleReturn} style={{ background: 'transparent', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            <i className="fa-solid fa-arrow-left"></i> Orqaga
          </button>
          <span style={{ color: '#8a1200', fontWeight: 'bold' }}>O'yin: {id}</span>
          <span style={{ color: '#43b581', fontSize: '0.9rem' }}><i className="fa-solid fa-clock"></i> {Math.floor(secondsPlayed / 60)}m {secondsPlayed % 60}s</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={reloadGame} style={{ background: '#241411', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            <i className="fa-solid fa-rotate-right"></i> Reload
          </button>
          <button onClick={toggleFullscreen} style={{ background: '#241411', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            <i className="fa-solid fa-expand"></i> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button onClick={() => setIsBreakMenuOpen(true)} style={{ background: '#8a1200', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fa-solid fa-pause"></i> Break Menu
          </button>
        </div>
      </div>

      {/* O'yin div */}
      <div
        ref={gameContainerRef}
        onClick={focusGame}
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#000',
          borderRadius: '8px',
          border: '1px solid #48201a',
          overflow: 'hidden',
          minHeight: '70vh',
        }}
      >
        <iframe
          ref={iframeRef}
          src={gameUrl}
          title="Fuzz Game"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>

      {/* Past panel */}
      <div style={{ marginTop: '1rem', padding: '0 1rem', color: '#6b524e', fontSize: '0.8rem', textAlign: 'center' }}>
        <i className="fa-solid fa-info-circle"></i> O'yin ichida <strong>Shift + Tab</strong> bosib Break Menu'ni ochish uchun, avval o'yin maydoniga bosing (fokus uchun).
      </div>

      {/* Break Menu Overlay */}
      {isBreakMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 11, 10, 0.95)',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '2rem',
          }}
        >
          <BreakMenu
            secondsPlayed={secondsPlayed}
            onReturn={handleReturn}
            onClose={() => {
              setIsBreakMenuOpen(false);
              setTimeout(() => iframeRef.current?.focus(), 50);
            }}
          />
        </div>
      )}
    </div>
  );
}
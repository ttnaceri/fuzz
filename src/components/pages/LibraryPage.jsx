import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function LibraryPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Desktop ekanligini aniqlash
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    
    // Foydalanuvchining sotib olgan o'yinlarini yuklash
    if (user) {
      api.get(`/api/users/${user.id}/library`)
        .then(data => {
          setGames(data.games || []);
          setLoading(false);
        })
        .catch(() => {
          toastError("Kutubxonani yuklashda xato");
          setLoading(false);
        });
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [user, toastError]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Mening Kutubxonam</h1>
        {isDesktop && (
          <div style={{ color: '#b9a6a2', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-folder"></i> Fuzz App Papkasi
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#b9a6a2' }}>Yuklanmoqda...</div>
      ) : games.length === 0 ? (
        <div style={{ color: '#b9a6a2', textAlign: 'center', marginTop: '3rem' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h3>Sizda hali o'yinlar yo'q</h3>
          <Link to="/store" style={{ color: '#8a1200', marginTop: '1rem', display: 'inline-block' }}>Do'konga o'tish</Link>
        </div>
      ) : (
        /* Desktop uchun Papka, Mobil uchun Grid */
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: '1rem' }}>
          {games.map(game => (
            <div key={game.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden', display: 'flex', flexDirection: isDesktop ? 'row' : 'column' }}>
              
              {/* Rasm */}
              <div style={{ width: isDesktop ? '120px' : '100%', height: isDesktop ? '80px' : '150px', backgroundColor: '#100b0a' }}>
                {game.image && <img src={game.image} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>

              {/* Ma'lumot */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{game.title}</h3>
                {isDesktop && <p style={{ color: '#43b581', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>O'ynalgan vaqt: {Math.floor((game.total_seconds || 0) / 60)} daqiqa</p>}
                
                <Link 
                  to={`/game/${game.id}/play`} 
                  style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', marginTop: 'auto' }}
                >
                  <i className="fa-solid fa-play"></i> O'ynash
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { fileSystemService } from '../services/fileSystemService.js';
import useToast from '../hooks/useToast.js';

export default function LibraryPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installedGames, setInstalledGames] = useState({});

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    
    // Backenddan foydalanuvchining kutubxonasini olish
    api.get(`/api/users/${user.id}/library`)
      .then(async data => {
        const gamesList = data.games || [];
        setGames(gamesList);

        // Har bir o'yin uchun papka mavjudligini tekshirish
        const installed = {};
        for (const game of gamesList) {
          try {
            const dataFile = await fileSystemService.readGameFile(game.id, 'gameData.json');
            installed[game.id] = !!dataFile;
          } catch {
            installed[game.id] = false;
          }
        }
        setInstalledGames(installed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleInstall = async (game) => {
    try {
      // O'yin faylini yuklash (masalan, iframe uchun URL ni saqlash)
      await fileSystemService.saveGameFile(game.id, 'gameData.json', JSON.stringify({
        gameUrl: game.game_url,
        installedAt: new Date().toISOString(),
        title: game.title,
      }));
      
      setInstalledGames(prev => ({ ...prev, [game.id]: true }));
      success(`"${game.title}" o'rnatildi!`);
    } catch (err) {
      toastError("O'rnatishda xato: " + err.message);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Yuklanmoqda...</div>;

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ color: '#f5eeee', margin: 0 }}>Mening Kutubxonam</h1>
        <Link to="/setup" className="btn btn-secondary btn-sm">
          <i className="fa-solid fa-folder" /> Papka sozlamalari
        </Link>
      </div>
      
      {games.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#48201a', marginBottom: '1rem' }}></i>
          <h3 style={{ color: '#f5eeee' }}>Sizda hali o'yinlar yo'q</h3>
          <Link to="/store" className="btn btn-primary mt-2">Do'konga o'tish</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {games.map(game => {
            const isInstalled = installedGames[game.id];
            return (
              <div key={game.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
                {game.image && <img src={game.image} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ color: '#f5eeee', margin: '0 0 1rem 0' }}>{game.title}</h3>
                  
                  {isInstalled ? (
                    <Link to={`/game/${game.id}/play`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-play"></i> O'ynash
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleInstall(game)}
                      style={{ width: '100%', textAlign: 'center', backgroundColor: '#43b581', color: '#fff', padding: '0.5rem', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-download"></i> O'rnatish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
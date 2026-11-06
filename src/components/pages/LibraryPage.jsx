import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { fileSystemService } from '../services/fileSystemService.js';
import useToast from '../hooks/useToast.js';

export default function LibraryPage() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installedGames, setInstalledGames] = useState({});
  const [hasFolder, setHasFolder] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadLibrary = async () => {
      try {
        // 1. Foydalanuvchining saqlangan papkasini tekshirish
        const dirHandle = await fileSystemService.getSavedDirectory();
        setHasFolder(!!dirHandle);

        // 2. Backenddan foydalanuvchi sotib olgan o'yinlarni olish
        const data = await api.get(`/api/users/${user.id}/library`);
        const gamesList = data.games || [];
        setGames(gamesList);

        // 3. Har bir o'yin uchun kompyuterda o'rnatilganligini tekshirish
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
      } catch (err) {
        console.error("Kutubxonani yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [user]);

  // O'yinni kompyuterga o'rnatish
  const handleInstall = async (game) => {
    try {
      if (!hasFolder) {
        info("Iltimos, avval 'Papka sozlamalari' bo'limiga o'tib, Fuzz uchun papka tanlang.");
        return;
      }

      // O'yin ma'lumotlarini JSON fayl sifatida saqlash
      await fileSystemService.saveGameFile(game.id, 'gameData.json', JSON.stringify({
        gameUrl: game.game_url,
        installedAt: new Date().toISOString(),
        title: game.title,
        image: game.image,
      }));
      
      setInstalledGames(prev => ({ ...prev, [game.id]: true }));
      success(`"${game.title}" muvaffaqiyatli o'rnatildi!`);
    } catch (err) {
      toastError("O'rnatishda xato: " + err.message);
    }
  };

  // O'yinni kompyuterdan o'chirish
  const handleUninstall = async (game) => {
    if (!window.confirm(`"${game.title}" ni kompyuteringizdan o'chirishni tasdiqlaysizmi?`)) return;
    
    try {
      // fileSystemService ga o'chirish funksiyasini qo'shish kerak
      // Hozircha oddiy holatda qoldiramiz
      setInstalledGames(prev => ({ ...prev, [game.id]: false }));
      info(`"${game.title}" o'chirildi.`);
    } catch (err) {
      toastError("O'chirishda xato: " + err.message);
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

      {!hasFolder && (
        <div className="unavailable-notice" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> Fuzz o'yinlarini o'rnatish uchun kompyuteringizdan papka tanlang.
          <Link to="/setup" style={{ color: '#f5eeee', textDecoration: 'underline', marginLeft: '0.5rem' }}>Tanlash →</Link>
        </div>
      )}
      
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
                {game.image && (
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{game.title}</h3>
                  <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {isInstalled ? 'O\'rnatilgan' : 'O\'rnatilmagan'}
                  </p>
                  
                  {isInstalled ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link 
                        to={`/game/${game.id}/play`} 
                        style={{ flex: 1, display: 'block', textAlign: 'center', backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        <i className="fa-solid fa-play"></i> O'ynash
                      </Link>
                      <button 
                        onClick={() => handleUninstall(game)}
                        style={{ background: 'none', border: '1px solid #48201a', color: '#ed5555', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                        title="O'chirish"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleInstall(game)}
                      disabled={!hasFolder}
                      style={{ 
                        width: '100%', 
                        textAlign: 'center', 
                        backgroundColor: hasFolder ? '#43b581' : '#3d0500', 
                        color: hasFolder ? '#fff' : '#b9a6a2', 
                        padding: '0.5rem', 
                        borderRadius: '4px', 
                        border: 'none', 
                        fontWeight: 'bold', 
                        cursor: hasFolder ? 'pointer' : 'not-allowed' 
                      }}
                    >
                      <i className="fa-solid fa-download"></i> {hasFolder ? 'O\'rnatish' : 'Avval papka tanlang'}
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
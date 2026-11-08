import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      // To'g'ridan-to'g'ri API ga murojaat qilamiz
      const res = await api.get('/games');
      // Natija qanday kelishidan qat'i nazar, arrayni ajratib olamiz
      const dataArray = Array.isArray(res) ? res : (res?.games || []);
      setGames(dataArray);
      
      // Keshga saqlaymiz (offline mode uchun)
      localStorage.setItem('fuzz_cached_games', JSON.stringify({ data: dataArray, timestamp: Date.now() }));
    } catch (err) {
      console.warn("Server xatosi, keshdan qidirilmoqda...");
      // Agar server o'chgan bo'lsa, keshdan olamiz
      const cached = localStorage.getItem('fuzz_cached_games');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setGames(parsed.data || []);
        } catch (e) {
          setError("Ma'lumotlarni yuklab bo'lmadi.");
        }
      } else {
        setError(err.message || "Could not load games");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="page">
      <div style={{ backgroundColor: '#8a1200', padding: '3rem 2rem', borderRadius: '12px', marginBottom: '3rem', backgroundImage: 'linear-gradient(45deg, #8a1200, #3d0500)' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>Xush kelibsiz, Fuzz'ga!</h1>
        <p style={{ color: '#f5eeee', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Eng sara o'yinlarni bizdan toping. Yangi o'yinlar, chegirmalar va boshqalar.</p>
        <Link to="/store" style={{ display: 'inline-block', backgroundColor: '#100b0a', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>Do'konni ko'rish</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#f5eeee', fontSize: '1.5rem', margin: 0 }}>Tanlangan O'yinlar</h2>
        <Link to="/store" style={{ color: '#b9a6a2', textDecoration: 'none' }}>Barchasini ko'rish →</Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchGames} />
      ) : games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#b9a6a2', backgroundColor: '#241411', borderRadius: '8px' }}>
          <i className="fa-solid fa-gamepad" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <p>Hozircha o'yinlar mavjud emas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {games.slice(0, 8).map((game) => (
            <Link key={game.id} to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <img src={game.image || game.cover} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</h3>
                  <div style={{ color: '#43b581', fontWeight: 'bold' }}>{formatPrice(game.price, game.currency)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
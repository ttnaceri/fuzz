import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/games?companyId=${id}`)
      .then(data => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("O'yinlarni yuklashda xato:", err);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <Link to="/companies" style={{ color: '#b9a6a2', marginBottom: '1rem', display: 'inline-block' }}>
        ← Kompaniyalarga qaytish
      </Link>
      <h1 className="page-title" style={{ color: '#f5eeee', marginBottom: '2rem' }}>Kompaniya O'yinlari</h1>
      
      {loading ? (
        <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p>
      ) : games.length === 0 ? (
        <p style={{ color: '#b9a6a2' }}>Bu kompaniyaning hali o'yinlari yo'q.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {games.map(g => (
            <div key={g.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
              {g.image && <img src={g.image} alt={g.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{g.title}</h3>
                <p style={{ color: '#43b581', fontWeight: 'bold' }}>${g.price}</p>
                <Link to={`/game/${g.id}`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', marginTop: '1rem' }}>
                  Batafsil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
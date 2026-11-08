import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService.js';

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // gameService dan ma'lumot olish
      const res = await gameService.getAllGames();
      // Natija qanday kelishidan qat'i nazar, arrayni ajratib olamiz
      const dataArray = Array.isArray(res) ? res : (res?.games || []);
      setGames(dataArray);
    } catch (err) {
      console.error("Games fetch error:", err);
      setError(err.message || "Could not load games");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refetch: fetchGames };
}
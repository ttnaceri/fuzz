import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService.js';

export default function useGames(options = {}) {
  const { filter, genre, companyId } = options;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter) params.filter = filter;
      if (genre) params.genre = genre;
      if (companyId) params.companyId = companyId;

      const data = await gameService.getGames(params);
      setGames(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filter, genre, companyId]);

  useEffect(() => { load(); }, [load]);

  return { games, loading, error, reload: load };
}
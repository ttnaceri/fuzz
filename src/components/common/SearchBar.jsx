import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce.js';

export default function SearchBar({ placeholder = 'Search games…', onSubmit }) {
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');
  const debounced = useDebounce(value, 400);
  const navigate = useNavigate();

  useEffect(() => {
    if (onSubmit) onSubmit(debounced);
  }, [debounced, onSubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--color-text-muted)' }} />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search games"
      />
    </form>
  );
}
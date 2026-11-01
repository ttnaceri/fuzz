import { useState, useEffect, useRef } from 'react'; // useState, useEffect, useRef import qilindi
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

const COMMANDS = ['help', 'clear', 'users', 'games', 'dashboard', 'events', 'exit'];

export default function AdminConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [dbUsers, setDbUsers] = useState([]); 
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.get('/api/admin/users')
        .then(data => setDbUsers(data.users.map(u => u.username))) 
        .catch(err => console.error("Userlarni yuklashda xato:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '`' || e.key === '~') { e.preventDefault(); setIsOpen(!isOpen); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    
    if (val.trim() === '') { 
      setSuggestions([]); 
      return; 
    }

    const cmdMatches = COMMANDS.filter(c => c.startsWith(val.toLowerCase()));
    const userMatches = dbUsers.filter(u => u.toLowerCase().includes(val.toLowerCase()));
    const allMatches = [...new Set([...cmdMatches, ...userMatches])].slice(0, 5); 
    setSuggestions(allMatches);
  };

  const executeCommand = (cmdText) => {
    const cmd = cmdText.trim().toLowerCase();
    if (!cmd) return;
    
    setHistory(prev => [...prev, { type: 'input', text: cmdText }]);
    setSuggestions([]);
    setInput('');

    let response = '';

    if (dbUsers.includes(cmdText)) {
       response = `Foydalanuvchi topildi: ${cmdText}. Tahrirlash uchun Users sahifasiga o'ting.`;
       navigate('/admin/users');
       setIsOpen(false);
       return;
    }

    if (cmd === 'help') response = 'Buyruqlar: help, clear, users, games, dashboard, events, exit';
    else if (cmd === 'clear') { setHistory([]); return; }
    else if (cmd === 'users') { navigate('/admin/users'); response = 'Users sahifasiga o\'tildi'; setIsOpen(false); }
    else if (cmd === 'games') { navigate('/admin/all-games'); response = 'Games sahifasiga o\'tildi'; setIsOpen(false); }
    else if (cmd === 'dashboard') { navigate('/admin'); response = 'Dashboard ga o\'tildi'; setIsOpen(false); }
    else if (cmd === 'events') { navigate('/admin/events'); response = 'Events ga o\'tildi'; setIsOpen(false); }
    else if (cmd === 'exit') { setIsOpen(false); return; }
    else response = `Noma'lum buyruq yoki foydalanuvchi. "help" yozing.`;

    setHistory(prev => [...prev, { type: 'output', text: response }]);
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', bottom: '20px', right: '20px', 
      width: '500px', height: '350px', 
      backgroundColor: '#19100e', border: '1px solid #48201a', borderRadius: '8px', 
      display: 'flex', flexDirection: 'column', zIndex: 9999,
      resize: 'both', overflow: 'hidden',
      minWidth: '300px', minHeight: '200px'
    }}>
      <div style={{ padding: '0.5rem', backgroundColor: '#241411', borderBottom: '1px solid #48201a', display: 'flex', justifyContent: 'space-between', cursor: 'move' }}>
        <span style={{ color: '#f5eeee', fontSize: '0.8rem' }}>Admin Console</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ed5555' }}>✖</button>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#100b0a', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {history.map((h, i) => <div key={i} style={{ color: h.type === 'input' ? '#f5eeee' : '#43b581', marginBottom: '0.3rem' }}>{h.type === 'input' ? '> ' : ''}{h.text}</div>)}
      </div>

      {suggestions.length > 0 && (
        <div style={{ backgroundColor: '#241411', borderTop: '1px solid #48201a', maxHeight: '120px', overflowY: 'auto' }}>
          {suggestions.map((s, idx) => (
            <div 
              key={idx} 
              onClick={() => { setInput(s); setSuggestions([]); inputRef.current.focus(); }} 
              style={{ padding: '0.4rem 1rem', color: '#b9a6a2', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #48201a' }}
            >
              {COMMANDS.includes(s) ? <i className="fa-solid fa-terminal" style={{marginRight: '8px', color: '#43b581'}}></i> : <i className="fa-solid fa-user" style={{marginRight: '8px'}}></i>}
              {s}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); executeCommand(input); }} style={{ display: 'flex', padding: '0.5rem', borderTop: '1px solid #48201a' }}>
        <span style={{ color: '#43b581', marginRight: '0.5rem' }}>$</span>
        <input 
          ref={inputRef} 
          type="text" 
          value={input} 
          onChange={handleInputChange} 
          onKeyDown={(e) => { 
            if (e.key === 'Tab' && suggestions.length > 0) { 
              e.preventDefault(); 
              setInput(suggestions[0]); 
              setSuggestions([]); 
            }
          }}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} 
          placeholder="Buyruq yoki username kiriting..." 
          autoComplete="off"
        />
      </form>
    </div>
  );
}
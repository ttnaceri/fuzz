import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

const COMMANDS = ['help', 'cls', 'clear', 'exit', 'kill', 'give', 'take', 'discount', 'newName', 'newUpd', 'ban', 'unBan', 'open'];

export default function AdminConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
    if (val.trim() === '') { setSuggestions([]); return; }
    const matches = COMMANDS.filter(c => c.startsWith(val.toLowerCase()));
    setSuggestions(matches);
  };

  const executeCommand = async (cmdText) => {
    const cmd = cmdText.trim().toLowerCase();
    if (!cmd) return;

    setHistory(prev => [...prev, { type: 'input', text: cmdText }]);
    setSuggestions([]);
    setInput('');

    // Mahalliy buyruqlar
    if (cmd === 'clear') { setHistory([]); return; }
    if (cmd === 'cls') { setHistory([]); return; }
    if (cmd === 'exit') { setIsOpen(false); navigate('/'); return; }
    
    // Sahifaga o'tish
    if (cmd.startsWith('open ')) {
      const page = cmd.split(' ')[1];
      navigate(`/admin/${page === 'home' ? '' : page}`);
      setHistory(prev => [...prev, { type: 'output', text: `${page} sahifasiga o'tildi.` }]);
      setIsOpen(false);
      return;
    }

    // Backendga yuboriladigan buyruqlar
    try {
      const res = await api.post('/api/admin/console', { command: cmdText });
      setHistory(prev => [...prev, { type: 'output', text: res.message || 'Bajarildi.' }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'output', text: `Xato: ${err.message}` }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', bottom: '20px', right: '20px', 
      width: '500px', height: '350px', 
      backgroundColor: '#19100e', border: '1px solid #48201a', borderRadius: '8px', 
      display: 'flex', flexDirection: 'column', zIndex: 9999,
      resize: 'both', overflow: 'hidden', minWidth: '300px', minHeight: '200px'
    }}>
      <div style={{ padding: '0.5rem', backgroundColor: '#241411', borderBottom: '1px solid #48201a', display: 'flex', justifyContent: 'space-between', cursor: 'move' }}>
        <span style={{ color: '#f5eeee', fontSize: '0.8rem' }}>Admin Console</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>✖</button>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#100b0a', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <div style={{ color: '#b9a6a2', marginBottom: '1rem' }}>
          Buyruqlar: kill, give, take, discount, newName, newUpd, ban, unBan, open, clear, exit.<br/>
          Yordam uchun <strong>help</strong> deb yozing.
        </div>
        {history.map((h, i) => <div key={i} style={{ color: h.type === 'input' ? '#f5eeee' : '#43b581', marginBottom: '0.3rem' }}>{h.type === 'input' ? '> ' : ''}{h.text}</div>)}
      </div>

      {suggestions.length > 0 && (
        <div style={{ backgroundColor: '#241411', borderTop: '1px solid #48201a', maxHeight: '120px', overflowY: 'auto' }}>
          {suggestions.map((s, idx) => (
            <div key={idx} onClick={() => { setInput(s); setSuggestions([]); inputRef.current.focus(); }} style={{ padding: '0.4rem 1rem', color: '#b9a6a2', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #48201a' }}>
              <i className="fa-solid fa-terminal" style={{marginRight: '8px', color: '#43b581'}}></i>{s}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); executeCommand(input); }} style={{ display: 'flex', padding: '0.5rem', borderTop: '1px solid #48201a' }}>
        <span style={{ color: '#43b581', marginRight: '0.5rem' }}>$</span>
        <input 
          ref={inputRef} type="text" value={input} onChange={handleInputChange} 
          onKeyDown={(e) => { if (e.key === 'Tab' && suggestions.length > 0) { e.preventDefault(); setInput(suggestions[0]); setSuggestions([]); }}}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} 
          placeholder="Buyruq..." autoComplete="off"
        />
      </form>
    </div>
  );
}
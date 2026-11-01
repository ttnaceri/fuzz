import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Klaviaturadan ochish/yopish (faqat input bo'lmaganda)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Backtick (`) yoki Tilde (~) bosilganda
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ochilganda inputga fokus berish
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Tarixga qo'shish
    setHistory((prev) => [...prev, { type: 'input', text: input }]);
    const cmd = input.trim().toLowerCase();
    let response = '';

    // Buyruqlarni tahlil qilish
    if (cmd === 'help') {
      response = 'Mavjud buyruqlar: help, clear, users, games, dashboard, exit';
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'users') {
      navigate('/admin/users');
      response = 'Foydalanuvchilar sahifasiga o\'tildi.';
      setIsOpen(false);
    } else if (cmd === 'games') {
      navigate('/admin/games');
      response = 'O\'yinlar sahifasiga o\'tildi.';
      setIsOpen(false);
    } else if (cmd === 'dashboard') {
      navigate('/admin');
      response = 'Boshqaruv paneliga o\'tildi.';
      setIsOpen(false);
    } else if (cmd === 'exit') {
      setIsOpen(false);
      return;
    } else {
      response = `Noma'lum buyruq: "${input}". Yordam uchun "help" yozing.`;
    }

    // Javobni tarixga qo'shish
    setHistory((prev) => [...prev, { type: 'output', text: response }]);
    setInput('');
  };

  if (!isOpen) return null;

  const styles = {
    wrapper: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '500px',
      height: '350px',
      backgroundColor: '#19100e',
      border: '1px solid #48201a',
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden',
      resize: 'both',
    },
    header: {
      padding: '0.5rem 1rem',
      backgroundColor: '#241411',
      borderBottom: '1px solid #48201a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'move',
    },
    body: {
      flex: 1,
      padding: '1rem',
      overflowY: 'auto',
      backgroundColor: '#100b0a',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
    },
    inputWrapper: {
      display: 'flex',
      padding: '0.5rem',
      borderTop: '1px solid #48201a',
      backgroundColor: '#19100e',
    },
    input: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      color: '#43b581',
      outline: 'none',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={{ color: '#f5eeee', fontWeight: 'bold', fontSize: '0.85rem' }}>Fuzz Admin Console</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer', fontSize: '1rem' }}>✖</button>
      </div>

      <div style={styles.body}>
        <div style={{ color: '#b9a6a2', marginBottom: '1rem' }}>
          Fuzz Admin Console v1.0.0<br />
          Buyruqlar ro'yxati uchun <strong>help</strong> deb yozing.<br />
          Yopish uchun <strong>Escape</strong> yoki <strong>exit</strong> yozing.
        </div>
        
        {history.map((item, idx) => (
          <div key={idx} style={{ color: item.type === 'input' ? '#f5eeee' : '#43b581', marginBottom: '0.5rem' }}>
            {item.type === 'input' ? '> ' : ''}{item.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} style={styles.inputWrapper}>
        <span style={{ color: '#43b581', marginRight: '0.5rem' }}>root@fuzz:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="Buyruq kiriting..."
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
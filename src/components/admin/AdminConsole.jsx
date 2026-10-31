import { useState, useEffect, useRef } from 'react';

export default function AdminConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // Klaviatura orqali ochish/yopish (faqat input/textarea bo'lmaganda)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Agar input yoki textarea ichida yozilayotgan bo'lsa, console ochilmasin
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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

    // Buyruqni tarixga qo'shish
    setHistory((prev) => [...prev, { type: 'input', text: input }]);
    
    // Buyruqlarni tahlil qilish (Demo)
    const cmd = input.trim().toLowerCase();
    let response = '';

    if (cmd === 'help') {
      response = 'Mavjud buyruqlar: help, clear, stats, ban <user>, give <user> <amount>';
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'stats') {
      response = 'Tizim statistikasi: 1500 Foydalanuvchi, 45 O\'yin.';
    } else {
      response = `Buyruq qabul qilindi: "${input}". (Backend ulanishi tez kunda)`;
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
      resize: 'both', // O'lchamini o'zgartirish imkoniyati
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
      color: '#43b581', // Yashil matn (terminal kabi)
      outline: 'none',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={{ color: '#f5eeee', fontWeight: 'bold', fontSize: '0.85rem' }}>Fuzz Admin Console</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>✖</button>
      </div>

      <div style={styles.body}>
        <div style={{ color: '#b9a6a2', marginBottom: '1rem' }}>
          Fuzz Admin Console v1.0.0<br />
          Buyruqlar ro'yxati uchun <strong>help</strong> deb yozing.<br />
          Yopish uchun <strong>Escape</strong> tugmasini bosing.
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
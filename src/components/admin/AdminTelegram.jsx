import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminTelegram() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { success, error: toastError } = useToast();

  // Xabarlarni yuklash funksiyasi
  const loadMessages = async () => {
    try {
      const res = await api.get('/api/admin/telegram/messages');
      setMessages(res.messages || []);
    } catch (err) {
      console.warn("Xabarlarni yuklashda xato");
    }
  };

  useEffect(() => {
    // Foydalanuvchilarni yuklash
    api.get('/api/admin/telegram/users').then(data => setUsers(data.users || [])).catch(() => {});
    
    // Xabarlarni yuklash
    loadMessages();

    // Har 5 soniyada xabarlarni yangilash (avtomatik)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedChat) return;
    try {
      await api.post('/api/admin/telegram/reply', { chatId: selectedChat, text: replyText });
      success("Xabar yuborildi!");
      setReplyText('');
      loadMessages(); // Xabarlarni qayta yuklash
    } catch { toastError("Xato"); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Telegram Support</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Chatlar ({users.length})</h3>
          {users.length === 0 ? <p style={{ color: '#b9a6a2' }}>Chatlar yo'q</p> : users.map(u => (
            <div key={u.id} onClick={() => setSelectedChat(u.telegram_id)} style={{ padding: '0.8rem', borderBottom: '1px solid #48201a', cursor: 'pointer', backgroundColor: selectedChat === u.telegram_id ? '#100b0a' : 'transparent' }}>
              <div style={{ color: '#f5eeee' }}>{u.username}</div>
              <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>TG: {u.telegram_id}</div>
            </div>
          ))}
        </div>
        
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Xabarlar</h3>
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #48201a', borderRadius: '4px', padding: '1rem', minHeight: '300px' }}>
            {!selectedChat ? <p style={{ color: '#b9a6a2', textAlign: 'center', marginTop: '100px' }}>Chatni tanlang...</p> : messages.filter(m => m.chat_id === selectedChat.toString()).map(m => (
              <div key={m.id} style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#f0b44d', fontSize: '0.8rem' }}>{m.username} • {new Date(m.created_at).toLocaleString()}</div>
                <div style={{ color: '#f5eeee' }}>{m.message}</div>
              </div>
            ))}
          </div>
          {selectedChat && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Javob yozing va Enter bosing..." 
                style={{ flex: 1, padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} 
              />
              <button onClick={handleReply} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Yuborish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
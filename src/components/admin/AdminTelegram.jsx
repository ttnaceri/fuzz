import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminTelegram() {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { success, error: toastError } = useToast();

  useEffect(() => {
    api.get('/api/admin/telegram/messages').then(data => setMessages(data.messages || [])).catch(() => {});
  }, []);

  const chats = [...new Set(messages.map(m => m.chat_id))];

  const handleReply = async () => {
    if (!replyText || !selectedChat) return;
    try {
      await api.post('/api/admin/telegram/reply', { chatId: selectedChat, text: replyText });
      success("Xabar yuborildi!");
      setReplyText('');
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Telegram Support</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Chatlar</h3>
          {chats.length === 0 ? <p style={{ color: '#b9a6a2' }}>Chatlar yo'q</p> : chats.map(chatId => (
            <div key={chatId} onClick={() => setSelectedChat(chatId)} style={{ padding: '0.8rem', borderBottom: '1px solid #48201a', cursor: 'pointer', backgroundColor: selectedChat === chatId ? '#100b0a' : 'transparent' }}>
              <div style={{ color: '#f5eeee' }}>Chat ID: {chatId}</div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Xabarlar</h3>
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #48201a', borderRadius: '4px', padding: '1rem', minHeight: '300px' }}>
            {!selectedChat ? <p style={{ color: '#b9a6a2', textAlign: 'center', marginTop: '100px' }}>Chatni tanlang...</p> : messages.filter(m => m.chat_id === selectedChat).map(m => (
              <div key={m.id} style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#f0b44d', fontSize: '0.8rem' }}>{m.username} • {new Date(m.created_at).toLocaleString()}</div>
                <div style={{ color: '#f5eeee' }}>{m.message}</div>
              </div>
            ))}
          </div>
          {selectedChat && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Javob yozing..." style={{ flex: 1, padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              <button onClick={handleReply} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yuborish</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
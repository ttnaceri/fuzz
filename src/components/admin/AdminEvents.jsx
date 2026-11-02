import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', image: '', link_url: '', start_date: '', end_date: '' });
  const { success, error: toastError } = useToast();

  const load = () => api.get('/api/admin/events').then(d => setEvents(d.events || []));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/events', form);
      success("Event qo'shildi!"); 
      load(); 
      setForm({ title: '', image: '', link_url: '', start_date: '', end_date: '' });
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Events Boshqaruvi</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
        <input type="text" placeholder="Event Nomi" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} required />
        <input type="text" placeholder="Rasm URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={{ padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        <input type="text" placeholder="Havola (Link URL)" value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} style={{ padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Boshlanish vaqti</label>
            <input type="datetime-local" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#b9a6a2', borderRadius: '4px' }} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Tugash vaqti</label>
            <input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#b9a6a2', borderRadius: '4px' }} required />
          </div>
        </div>
        <button type="submit" style={{ padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Event Rejalashtirish</button>
      </form>

      <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Aktiv Eventlar</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {events.map(ev => (
          <div key={ev.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
            {ev.image && <img src={ev.image} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{ev.title}</h3>
              <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Tugaydi: {new Date(ev.end_date).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
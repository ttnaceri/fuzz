import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/useLanguage.js';
import useToast from '../hooks/useToast.js';

export default function AdminEvents() {
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Yangi event formasi
  const [form, setForm] = useState({
    title_uz: '', title_ru: '', title_en: '',
    image: '', link_url: '', start_date: '', end_date: ''
  });

  const loadEvents = () => {
    setLoading(true);
    api.get('/api/admin/events')
      .then(data => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title_uz || !form.start_date || !form.end_date) {
      return toastError("Kamida O'zbekcha nom va vaqtlarni kiriting!");
    }

    try {
      await api.post('/api/admin/events', form);
      success("Event muvaffaqiyatli qo'shildi!");
      setForm({ title_uz: '', title_ru: '', title_en: '', image: '', link_url: '', start_date: '', end_date: '' });
      loadEvents();
    } catch (err) {
      toastError(err.message || "Xato");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/api/admin/events/${id}`);
      success("Event o'chirildi!");
      loadEvents();
    } catch (err) {
      toastError(err.message || "Xato");
    }
  };

  const handleEdit = (event) => {
    // Tahrirlash uchun formani to'ldirish (keyingi qadam)
    setForm({
      id: event.id,
      title_uz: event.title_uz || '', title_ru: event.title_ru || '', title_en: event.title_en || '',
      image: event.image || '', link_url: event.link_url || '',
      start_date: event.start_date ? event.start_date.split('.')[0] : '', // Formatni tozalash
      end_date: event.end_date ? event.end_date.split('.')[0] : ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    try {
      await api.put(`/api/admin/events/${form.id}`, form);
      success("Event yangilandi!");
      setForm({ title_uz: '', title_ru: '', title_en: '', image: '', link_url: '', start_date: '', end_date: '' });
      loadEvents();
    } catch (err) {
      toastError(err.message || "Xato");
    }
  };

  const inputStyle = { width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '0.5rem' };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Eventlar</h1>

      {/* Forma (Yangi qo'shish yoki Tahrirlash) */}
      <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>
          {form.id ? 'Eventni tahrirlash' : 'Yangi event qo\'shish'}
        </h3>
        <form onSubmit={form.id ? handleUpdate : handleCreate}>
          
          {/* 3 tilda nom kiritish */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Nomi (UZ)</label>
              <input type="text" style={inputStyle} value={form.title_uz} onChange={e => setForm({...form, title_uz: e.target.value})} placeholder="O'zbekcha nomi" />
            </div>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Название (RU)</label>
              <input type="text" style={inputStyle} value={form.title_ru} onChange={e => setForm({...form, title_ru: e.target.value})} placeholder="Русское название" />
            </div>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Title (EN)</label>
              <input type="text" style={inputStyle} value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} placeholder="English title" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Rasm URL</label>
              <input type="text" style={inputStyle} value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Havola (Link)</label>
              <input type="text" style={inputStyle} value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} placeholder="/store" />
            </div>
            <div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Boshlanish vaqti</label>
              <input type="datetime-local" style={inputStyle} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Tugash vaqti</label>
              <input type="datetime-local" style={inputStyle} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {form.id ? 'Saqlash' : 'Qo\'shish'}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm({ title_uz: '', title_ru: '', title_en: '', image: '', link_url: '', start_date: '', end_date: '' })} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Eventlar ro'yxati */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {loading ? <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p> : events.map(event => (
          <div key={event.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem' }}>
            {event.image && <img src={event.image} alt={event.title_uz} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />}
            <h4 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>{event.title_uz || event.title_en}</h4>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(event)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#f0b44d', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                <i className="fa-solid fa-pen"></i> Tahrirlash
              </button>
              <button onClick={() => handleDelete(event.id)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ed5555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                <i className="fa-solid fa-trash"></i> O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
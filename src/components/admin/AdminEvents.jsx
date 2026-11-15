import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/useLanguage.js';
import useToast from '../hooks/useToast.js';

export default function AdminEvents() {
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forma holati
  const [form, setForm] = useState({
    id: null,
    title_uz: '', title_ru: '', title_en: '',
    image: '', link_url: '', start_date: '', end_date: ''
  });
  
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' | 'drag' | 'paste'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadEvents = () => {
    setLoading(true);
    api.get('/api/admin/events')
      .then(data => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  // Rasmni fayldan o'qib, backendga yuklash (Base64)
  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return toastError("Iltimos, faqat rasm faylini yuklang (JPG, PNG)");
    }
    if (file.size > 1024 * 1024) {
      return toastError("Rasm hajmi 1MB dan oshmasligi kerak!");
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Base64 formatidan "data:image/jpeg;base64," qismini olib tashlaymiz
        const base64Data = reader.result.split(',')[1];
        const res = await api.post('/api/upload', { 
          base64: base64Data, 
          mimeType: file.type 
        });
        // Backend qaytargan URL ni formaga yozamiz
        const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://my-backend.updbackend.workers.dev/fuzz'}${res.url}`;
        setForm(prev => ({ ...prev, image: fullImageUrl }));
        success("Rasm muvaffaqiyatli yuklandi!");
      } catch (err) {
        toastError(err.message || "Rasm yuklashda xato");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Ctrl + V (Paste)
  useEffect(() => {
    const handlePaste = (e) => {
      if (uploadMethod !== 'paste') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          handleImageUpload(file);
          break;
        }
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadMethod]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title_uz || !form.start_date || !form.end_date) {
      return toastError("Kamida O'zbekcha nom va vaqtlarni kiriting!");
    }

    try {
      await api.post('/api/admin/events', form);
      success("Event muvaffaqiyatli qo'shildi!");
      resetForm();
      loadEvents();
    } catch (err) {
      toastError(err.message || "Xato");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    try {
      await api.put(`/api/admin/events/${form.id}`, form);
      success("Event yangilandi!");
      resetForm();
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
    setForm({
      id: event.id,
      title_uz: event.title_uz || '', title_ru: event.title_ru || '', title_en: event.title_en || '',
      image: event.image || '', link_url: event.link_url || '',
      start_date: event.start_date ? event.start_date.split('.')[0] : '',
      end_date: event.end_date ? event.end_date.split('.')[0] : ''
    });
    setUploadMethod('url'); // Tahrirlashda URL rejimiga o'tish
  };

  const resetForm = () => {
    setForm({ id: null, title_uz: '', title_ru: '', title_en: '', image: '', link_url: '', start_date: '', end_date: '' });
    setUploadMethod('url');
  };

  const inputStyle = { width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '0.5rem' };
  const tabBtn = (isActive) => ({
    padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
    backgroundColor: isActive ? '#8a1200' : '#100b0a', color: isActive ? '#fff' : '#b9a6a2'
  });

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Eventlar</h1>

      {/* Forma */}
      <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>{form.id ? 'Eventni tahrirlash' : "Yangi event qo'shish"}</h3>
        
        <form onSubmit={form.id ? handleUpdate : handleCreate}>
          
          {/* Sarlavhalar */}
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

          {/* Rasm Yuklash Qismi */}
          <div style={{ backgroundColor: '#1a0f0d', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" style={tabBtn(uploadMethod === 'url')} onClick={() => setUploadMethod('url')}>Rasm URL</button>
              <button type="button" style={tabBtn(uploadMethod === 'drag')} onClick={() => setUploadMethod('drag')}>Drag & Drop</button>
              <button type="button" style={tabBtn(uploadMethod === 'paste')} onClick={() => setUploadMethod('paste')}>Ctrl + V</button>
            </div>

            {uploadMethod === 'url' && (
              <input type="text" style={inputStyle} value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://example.com/image.jpg" />
            )}

            {uploadMethod === 'drag' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #48201a', borderRadius: '8px', padding: '2rem', textAlign: 'center',
                  cursor: 'pointer', backgroundColor: '#100b0a', color: '#b9a6a2'
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e.target.files[0])} />
                {uploading ? (
                  <p>Yuklanmoqda...</p>
                ) : form.image ? (
                  <>
                    <img src={form.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <p style={{ color: '#43b581' }}>Rasm yuklandi! (Almashtirish uchun bosing)</p>
                  </>
                ) : (
                  <p>Rasmni bu yerga sudrab tashlang yoki bosing</p>
                )}
              </div>
            )}

            {uploadMethod === 'paste' && (
              <div style={{ border: '2px dashed #48201a', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#100b0a', color: '#b9a6a2' }}>
                {uploading ? (
                  <p>Yuklanmoqda...</p>
                ) : form.image ? (
                  <>
                    <img src={form.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <p style={{ color: '#43b581' }}>Rasm muvaffaqiyatli qo'yildi! (Almashtirish uchun Ctrl+V bosing)</p>
                  </>
                ) : (
                  <p>Rasm nusxasini (Ctrl+C) olib, shu yerga <strong>Ctrl+V</strong> bosing</p>
                )}
              </div>
            )}
            
            {/* Agar rasm URL bo'lsa, preview ko'rsatish */}
            {form.image && uploadMethod === 'url' && (
              <div style={{ marginTop: '1rem' }}>
                <img src={form.image} alt="Preview" style={{ maxHeight: '80px', borderRadius: '4px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Havola (Link)</label>
              <input type="text" style={inputStyle} value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} placeholder="/store" />
            </div>
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
            <button type="submit" disabled={uploading} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {form.id ? 'Saqlash' : "Qo'shish"}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Eventlar ro'yxati (o'zgarmagan) */}
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
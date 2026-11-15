import { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { useLanguage } from '../context/useLanguage.js';
import { api } from '../services/api.js';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Avatar yuklash uchun
  const [uploadMethod, setUploadMethod] = useState('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !username.trim() || username.trim().length < 3) {
      return toastError(t('profile.minLength'));
    }
    if (username.trim() === user.username) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}/username`, { username: username.trim() });
      success(t('profile.success'));
      if (refreshUser) await refreshUser();
      setEditing(false);
    } catch (err) {
      toastError(err.message || t('profile.error'));
    } finally {
      setLoading(false);
    }
  };

  // Rasm yuklash (Fayldan)
  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return toastError("Iltimos, faqat rasm faylini yuklang");
    }
    if (file.size > 1024 * 1024) {
      return toastError("Rasm hajmi 1MB dan oshmasligi kerak!");
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const res = await api.post('/api/upload', { base64: base64Data, mimeType: file.type });
        
        // Backend qaytargan URL ni to'liq manzilga aylantiramiz
        const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://my-backend.updbackend.workers.dev/fuzz'}${res.url}`;
        
        // Userni yangilaymiz
        await api.put(`/api/users/${user.id}/avatar`, { avatarUrl: fullUrl });
        success("Profil rasmi yangilandi!");
        if (refreshUser) await refreshUser();
      } catch (err) {
        toastError(err.message || "Rasm yuklashda xato");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (uploadMethod !== 'paste') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          handleImageUpload(items[i].getAsFile());
          break;
        }
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadMethod]);

  const tabBtn = (isActive) => ({
    padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
    backgroundColor: isActive ? '#8a1200' : '#100b0a', color: isActive ? '#fff' : '#b9a6a2'
  });

  return (
    <div className="page">
      <h1 className="page-title">{t('profile.title')}</h1>

      {/* Profil rasmi */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#100b0a', border: '2px solid #48201a', margin: '0 auto 1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="fa-solid fa-user" style={{ fontSize: '4rem', color: '#48201a' }}></i>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Rasmni o'zgartirish</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" style={tabBtn(uploadMethod === 'url')} onClick={() => setUploadMethod('url')}>Rasm URL</button>
            <button type="button" style={tabBtn(uploadMethod === 'drag')} onClick={() => setUploadMethod('drag')}>Drag & Drop</button>
            <button type="button" style={tabBtn(uploadMethod === 'paste')} onClick={() => setUploadMethod('paste')}>Ctrl + V</button>
          </div>

          {uploadMethod === 'drag' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #48201a', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', backgroundColor: '#100b0a', color: '#b9a6a2' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e.target.files[0])} />
              {uploading ? <p>Yuklanmoqda...</p> : <p>Rasmni bu yerga sudrab tashlang yoki bosing</p>}
            </div>
          )}

          {uploadMethod === 'paste' && (
            <div style={{ border: '2px dashed #48201a', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#100b0a', color: '#b9a6a2' }}>
              {uploading ? <p>Yuklanmoqda...</p> : <p>Rasm nusxasini (Ctrl+C) olib, shu yerga <strong>Ctrl+V</strong> bosing</p>}
            </div>
          )}

          {uploadMethod === 'url' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="https://..." id="avatar-url-input" className="form-input" style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={async () => {
                const url = document.getElementById('avatar-url-input').value;
                if (!url) return;
                setUploading(true);
                try {
                  await api.put(`/api/users/${user.id}/avatar`, { avatarUrl: url });
                  success("Profil rasmi yangilandi!");
                  if (refreshUser) await refreshUser();
                } catch (err) { toastError(err.message); }
                finally { setUploading(false); }
              }}>{uploading ? '...' : 'Saqlash'}</button>
            </div>
          )}
        </div>
      </div>

      {/* Ism o'zgartirish */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ color: '#f5eeee', fontSize: '1.2rem', marginBottom: '1rem' }}>Hisob ma'lumotlari</h2>
        <div>
          <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{t('profile.username')}</label>
          {!editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <strong style={{ color: '#f5eeee', fontSize: '1.1rem' }}>{user?.username || '—'}</strong>
              <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: '1px solid #48201a', color: '#b9a6a2', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                <i className="fa-solid fa-pen"></i> {t('profile.editUsername')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : t('common.save')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setUsername(user.username); setEditing(false); }}>{t('common.cancel')}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
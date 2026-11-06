import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileSystemService } from '../services/fileSystemService.js';
import useToast from '../hooks/useToast.js';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [hasDirectory, setHasDirectory] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    checkDirectory();
  }, []);

  const checkDirectory = async () => {
    try {
      const handle = await fileSystemService.getSavedDirectory();
      setHasDirectory(!!handle);
    } catch (e) {
      setHasDirectory(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      await fileSystemService.selectDirectory();
      success("Fuzz papkasi muvaffaqiyatli tanlandi!");
      navigate('/library');
    } catch (err) {
      toastError(err.message);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Yuklanmoqda...</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ color: '#f5eeee', marginBottom: '1rem', textAlign: 'center' }}>Fuzz O'rnatish</h1>
        <p style={{ color: '#b9a6a2', marginBottom: '2rem', textAlign: 'center', lineHeight: '1.6' }}>
          Fuzz o'yinlarini yuklab olish va saqlash uchun kompyuteringizdan papka tanlang.
          Bu papkada o'yinlar, ma'lumotlar va loglar saqlanadi.
        </p>

        {hasDirectory ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#43b581', marginBottom: '1rem' }}>Papka allaqachon tanlangan.</p>
            <button onClick={() => navigate('/library')} className="btn btn-primary btn-block">Kutubxonaga o'tish</button>
          </div>
        ) : (
          <button onClick={handleSelectFolder} className="btn btn-primary btn-block">
            <i className="fa-solid fa-folder-open" /> Papka tanlash
          </button>
        )}
      </div>
    </div>
  );
}
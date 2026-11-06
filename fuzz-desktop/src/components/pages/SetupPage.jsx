import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SetupPage() {
  const [folder, setFolder] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Papka tanlash (Faqat Chrome, Edge kabi brauzerlarda ishlaydi)
  const handleBrowse = async () => {
    try {
      if (!window.showDirectoryPicker) {
        setError("Brauzeringiz papka tanlashni qo'llab-quvvatlamaydi. Iltimos, Chrome yoki Edge dan foydalaning.");
        return;
      }
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setFolder(dirHandle.name);
      setError('');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError("Papka tanlashda xatolik yuz berdi.");
      }
    }
  };

  // O'rnatish jarayoni
  const handleInstall = () => {
    if (!folder) {
      setError("Iltimos, avval o'rnatish uchun papkani tanlang.");
      return;
    }

    setIsInstalling(true);
    setError('');

    // O'rnatish animatsiyasi (Soxta resurs yuklash)
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5; // 5-20% orasida oshadi
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // 100% bo'lganda localStorage ga saqlaymiz
        setTimeout(() => {
          localStorage.setItem('fuzz_app_installed', 'true');
          localStorage.setItem('fuzz_install_folder', folder);
          navigate('/'); // Asosiy sahifaga o'tish
        }, 500);
      }
      setProgress(currentProgress);
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem' }}>
      <div style={{ backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '12px', padding: '3rem', width: '100%', maxWidth: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/image/logo.png" alt="Fuzz" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h1 style={{ color: '#f5eeee', fontSize: '2rem', margin: 0 }}>Fuzz App O'rnatish</h1>
          <p style={{ color: '#b9a6a2', marginTop: '0.5rem' }}>Kompyuteringizda Fuzz uchun joy tanlang</p>
        </div>

        {!isInstalling ? (
          <>
            <div style={{ backgroundColor: '#100b0a', border: '1px solid #48201a', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <i className="fa-solid fa-folder" style={{ color: '#f0b44d', fontSize: '1.5rem' }}></i>
              <div style={{ flex: 1, color: folder ? '#f5eeee' : '#b9a6a2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folder ? `C:\\Games\\${folder}` : "Papka tanlanmagan..."}
              </div>
              <button onClick={handleBrowse} className="btn btn-secondary" style={{ border: '1px solid #48201a', backgroundColor: '#241411', color: '#f5eeee' }}>
                Browse
              </button>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(237, 85, 85, 0.1)', border: '1px solid #ed5555', color: '#ed5555', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

            <button 
              onClick={handleInstall} 
              disabled={!folder}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: folder ? 'pointer' : 'not-allowed', opacity: folder ? 1 : 0.5 }}
            >
              O'rnatishni Boshlash
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#f5eeee', marginBottom: '1rem', fontSize: '1.1rem' }}>Resurslar o'rnatilmoqda, iltimos kuting...</p>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#100b0a', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#43b581', transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>{progress}%</p>
          </div>
        )}

      </div>
    </div>
  );
}
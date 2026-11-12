import { useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import Sidebar from '../common/Sidebar.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Telegram ID o'zgartirish
  const [tgStep, setTgStep] = useState(1); // 1: yangi ID, 2: kod
  const [newTgId, setNewTgId] = useState('');
  const [tgCode, setTgCode] = useState('');
  const [tgLoading, setTgLoading] = useState(false);

  // Danger Zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Telegram ID so'rash ---
  const handleRequestTelegram = async (e) => {
    e.preventDefault();
    if (!user) return;
    const clean = newTgId.replace(/\D/g, '');
    if (!/^\d{6,15}$/.test(clean)) return toastError("Noto'g'ri Telegram ID");

    setTgLoading(true);
    try {
      await authService.requestTelegramChange(user.id, clean);
      success("Kod yangi Telegram ID ga yuborildi");
      setTgStep(2);
    } catch (err) {
      toastError(err.message || "Xato");
    } finally {
      setTgLoading(false);
    }
  };

  // --- Telegram ID kodni tasdiqlash ---
  const handleVerifyTelegram = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (tgCode.length !== 5) return toastError("5 xonali kodni kiriting");

    setTgLoading(true);
    try {
      await authService.verifyTelegramChange(user.id, tgCode);
      success("Telegram ID muvaffaqiyatli o'zgartirildi");
      if (refreshUser) refreshUser();
      setTgStep(1);
      setNewTgId('');
      setTgCode('');
    } catch (err) {
      toastError(err.message || "Xato");
    } finally {
      setTgLoading(false);
    }
  };

  // --- Akkauntni o'chirish ---
  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== user.username) {
      return toastError("Tasdiqlash uchun username'ingizni kiriting");
    }

    setDeleteLoading(true);
    try {
      await authService.deleteAccount(user.id);
      success("Akkaunt o'chirildi");
      await logout();
      navigate('/login');
    } catch (err) {
      toastError(err.message || "Xato");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Settings</h1>

        {/* Theme */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>Theme</h3>
          <p>Current theme: <strong>{theme}</strong></p>
          <button className="btn btn-secondary mt-2" onClick={toggleTheme}>Toggle theme</button>
        </div>

        {/* Telegram ID */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>
            <i className="fa-brands fa-telegram"></i> Telegram ID
          </h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Joriy Telegram ID: <strong>{user?.telegram_id || 'Yo\'q'}</strong>
          </p>

          {tgStep === 1 && (
            <form onSubmit={handleRequestTelegram}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Yangi Telegram ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTgId}
                  onChange={(e) => setNewTgId(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="Yangi Telegram ID"
                />
              </div>
              <button type="submit" disabled={tgLoading} className="btn btn-primary">
                {tgLoading ? 'Yuborilmoqda...' : 'Kod yuborish'}
              </button>
            </form>
          )}

          {tgStep === 2 && (
            <form onSubmit={handleVerifyTelegram}>
              <p style={{ color: '#43b581', marginBottom: '1rem' }}>
                Kod yangi Telegram ID ({newTgId}) ga yuborildi. 5 daqiqa amal qiladi.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Tasdiqlash kodi (5 xonali)</label>
                <input
                  type="text"
                  className="form-input"
                  value={tgCode}
                  onChange={(e) => setTgCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="00000"
                  maxLength={5}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
              </div>
              <button type="submit" disabled={tgLoading} className="btn btn-primary">
                {tgLoading ? 'Tekshirilmoqda...' : 'Kodni tasdiqlash'}
              </button>
              <button
                type="button"
                onClick={() => { setTgStep(1); setTgCode(''); }}
                className="btn btn-secondary"
                style={{ marginLeft: '0.5rem' }}
              >
                Bekor qilish
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: '#241411', border: '1px solid #ed5555', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ color: '#ed5555', marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> Danger Zone
          </h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Akkauntni o'chirish bu amalni ortga qaytarib bo'lmaydi.
          </p>
          {!showDeleteConfirm ? (
            <button
              className="btn"
              style={{ backgroundColor: '#ed5555', color: '#fff', border: 'none' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Akkauntni o'chirish
            </button>
          ) : (
            <div style={{ backgroundColor: 'rgba(237, 85, 85, 0.1)', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ color: '#ed5555', marginBottom: '0.5rem' }}>
                Tasdiqlash uchun <strong>{user?.username}</strong> deb yozing:
              </p>
              <input
                type="text"
                className="form-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={user?.username || 'username'}
                style={{ marginBottom: '0.5rem' }}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== user?.username}
                style={{ backgroundColor: '#ed5555', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
              >
                {deleteLoading ? 'O\'chirilmoqda...' : 'Tasdiqlash va o\'chirish'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="btn btn-secondary"
              >
                Bekor qilish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
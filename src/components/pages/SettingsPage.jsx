import { useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import { authService } from '../services/authService.js';
import Sidebar from '../common/Sidebar.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tgStep, setTgStep] = useState(1);
  const [newTgId, setNewTgId] = useState('');
  const [tgCode, setTgCode] = useState('');
  const [tgLoading, setTgLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleRequestTelegram = async (e) => {
    e.preventDefault();
    if (!user) return;
    const clean = newTgId.replace(/\D/g, '');
    if (!/^\d{6,15}$/.test(clean)) return toastError(t('common.error'));

    setTgLoading(true);
    try {
      await authService.requestTelegramChange(user.id, clean);
      success(t('settings.codeSent'));
      setTgStep(2);
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setTgLoading(false);
    }
  };

  const handleVerifyTelegram = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (tgCode.length !== 5) return toastError(t('common.error'));

    setTgLoading(true);
    try {
      await authService.verifyTelegramChange(user.id, tgCode);
      success(t('settings.codeVerified'));
      if (refreshUser) refreshUser();
      setTgStep(1);
      setNewTgId('');
      setTgCode('');
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setTgLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== user.username) {
      return toastError(t('settings.confirmDelete'));
    }

    setDeleteLoading(true);
    try {
      await authService.deleteAccount(user.id);
      success(t('common.success'));
      await logout();
      navigate('/login');
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('settings.title')}</h1>

        {/* Theme */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>{t('settings.theme')}</h3>
          <p>{t('settings.theme')}: <strong>{theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}</strong></p>
          <button className="btn btn-secondary mt-2" onClick={toggleTheme}>{t('settings.theme')}</button>
        </div>

        {/* Telegram ID */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>
            <i className="fa-brands fa-telegram"></i> {t('settings.telegramId')}
          </h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {t('settings.currentTelegramId')}: <strong>{user?.telegram_id || '—'}</strong>
          </p>

          {tgStep === 1 && (
            <form onSubmit={handleRequestTelegram}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{t('settings.newTelegramId')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTgId}
                  onChange={(e) => setNewTgId(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder={t('settings.newTelegramId')}
                />
              </div>
              <button type="submit" disabled={tgLoading} className="btn btn-primary">
                {tgLoading ? t('common.loading') : t('settings.sendCode')}
              </button>
            </form>
          )}

          {tgStep === 2 && (
            <form onSubmit={handleVerifyTelegram}>
              <p style={{ color: '#43b581', marginBottom: '1rem' }}>
                {t('settings.codeSent')} ({t('settings.codeExpires')})
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{t('settings.verifyCode')}</label>
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
                {tgLoading ? t('common.loading') : t('settings.verifyCode')}
              </button>
              <button
                type="button"
                onClick={() => { setTgStep(1); setTgCode(''); }}
                className="btn btn-secondary"
                style={{ marginLeft: '0.5rem' }}
              >
                {t('common.cancel')}
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: '#241411', border: '1px solid #ed5555', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ color: '#ed5555', marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {t('settings.dangerZone')}
          </h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {t('settings.deleteWarning')}
          </p>
          {!showDeleteConfirm ? (
            <button
              className="btn"
              style={{ backgroundColor: '#ed5555', color: '#fff', border: 'none' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t('settings.deleteAccount')}
            </button>
          ) : (
            <div style={{ backgroundColor: 'rgba(237, 85, 85, 0.1)', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ color: '#ed5555', marginBottom: '0.5rem' }}>
                {t('settings.confirmDelete')}: <strong>{user?.username}</strong>
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
                {deleteLoading ? t('common.loading') : t('settings.deleteConfirm')}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
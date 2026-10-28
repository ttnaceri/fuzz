import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import useToast from '../hooks/useToast.js';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const telegramId = location.state?.telegramId || '';
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telegramId) return toastError("Telegram ID topilmadi.");
    setLoading(true);
    try {
      await authService.resetPassword({ telegramId, code, newPassword });
      success("Parol o'zgartirildi! Yangi parolingiz bilan kiring.");
      navigate('/login');
    } catch (err) {
      toastError(err.message || "Kod xato yoki muddati o'tgan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Yangi Parol</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tasdiqlash kodi (5 xonali)</label>
          <input type="text" className="form-input" maxLength="5" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Yangi Parol</label>
          <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
        </button>
      </form>
    </div>
  );
}
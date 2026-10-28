import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import useToast from '../hooks/useToast.js';

export default function ForgotPasswordPage() {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(telegramId);
      success("Botga 5 xonali kod yuborildi. (5 daqiqa amal qiladi)");
      navigate('/reset-password', { state: { telegramId } });
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Parolni tiklash</h1>
      <p className="text-muted mb-2">Telegram ID ingizni kiriting.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Telegram ID</label>
          <input type="text" className="form-input" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Yuborilmoqda...' : 'Kodni yuborish'}
        </button>
      </form>
      <div className="auth-card__footer mt-2 text-center">
        <Link to="/login">Kirish sahifasiga qaytish</Link>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="auth-card text-center">
      <i className="fa-solid fa-clock" style={{ fontSize: '3rem', color: 'var(--color-warning)', marginBottom: '1rem' }} />
      <h1>Tez kunda!</h1>
      <p className="text-muted mb-2">Parolni tiklash tizimi hozircha ishlab chiqilmoqda. Iltimos, keyinroq urinib ko'ring.</p>
      <Link to="/login" className="btn btn-primary mt-2">Kirish sahifasiga qaytish</Link>
    </div>
  );
}
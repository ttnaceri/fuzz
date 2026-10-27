import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { validateLoginForm } from '../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validateLoginForm(form);
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Sign in</h1>
      {serverError && <div className="form-error mb-2">{serverError}</div>}
      <form onSubmit={submit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="auth-card__footer">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}
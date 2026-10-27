import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { validateRegisterForm } from '../utils/validators.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validateRegisterForm(form);
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      navigate('/account', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-card">
      <h1>Create account</h1>
      {serverError && <div className="form-error mb-2">{serverError}</div>}
      <form onSubmit={submit} noValidate>
        {[
          ['username', 'Username', 'text', 'username'],
          ['email', 'Email', 'email', 'email'],
          ['password', 'Password', 'password', 'new-password'],
          ['confirm', 'Confirm password', 'password', 'new-password'],
        ].map(([k, label, type, ac]) => (
          <div className="form-group" key={k}>
            <label className="form-label" htmlFor={k}>{label}</label>
            <input id={k} type={type} className="form-input" value={form[k]} onChange={set(k)} autoComplete={ac} />
            {errors[k] && <div className="form-error">{errors[k]}</div>}
          </div>
        ))}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <div className="auth-card__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
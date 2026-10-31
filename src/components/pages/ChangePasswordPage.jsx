import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) return toastError("Parollar mos kelmadi!");
    
    success("Parol muvaffaqiyatli o'zgartirildi!");
    navigate('/login');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#8a1200', textAlign: 'center', marginBottom: '1.5rem' }}>New Password</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '1rem', boxSizing: 'border-box' }} />
          <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '1rem', boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Password</button>
        </form>
      </div>
    </div>
  );
}
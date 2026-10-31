import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';

export default function ResetPasswordCodePage() {
  const [code, setCode] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code) return;
    if (code === '123456') {
      success("Kod tasdiqlandi!");
      navigate('/reset-password/change');
    } else {
      toastError("Kod noto'g'ri!");
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#8a1200', textAlign: 'center', marginBottom: '1.5rem' }}>Enter Code</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '1rem', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '5px' }} />
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Verify Code</button>
        </form>
      </div>
    </div>
  );
}
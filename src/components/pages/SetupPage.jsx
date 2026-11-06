import { useNavigate } from 'react-router-dom';

export default function SetupPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <i className="fa-solid fa-desktop" style={{ fontSize: '3rem', color: '#8a1200', marginBottom: '1rem' }}></i>
        <h1 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Fuzz Setup</h1>
        <p style={{ color: '#b9a6a2', marginBottom: '2rem', lineHeight: '1.6' }}>
          Fuzz o'yinlarini saqlash uchun maxsus dastur kerak. Iltimos, saytning yuqori o'ng burchagidagi <strong>"Download"</strong> tugmasini bosib, dasturni yuklab oling va o'rnating.
        </p>
        <button onClick={() => navigate('/library')} className="btn btn-primary">
          Kutubxonaga qaytish
        </button>
      </div>
    </div>
  );
}
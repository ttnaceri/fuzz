import { useState, useEffect, useRef, Component } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';

// QR kod chizishda xato bo'lsa ushlab qolish uchun
class QRBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: '#ed5555', padding: '1rem' }}>QR kodni yuklashda xatolik.</div>;
    }
    return this.props.children;
  }
}

// ==========================================
// MOBIL QR SKANER KOMPONENTI
// ==========================================
function MobileQRScanner({ onBack }) {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        // Orqa kamerani ochishga harakat qilamiz
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Kamera xatosi:", err);
        setHasCamera(false);
        setErrorMsg("Kamerani ochish imkoni bo'lmadi. Ruxsat berilganligini tekshiring.");
      }
    };

    startCamera();

    // Komponent yopilganda kamerani o'chirish
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ color: '#f5eeee', marginBottom: '1rem' }}>QR Skaner</h2>
      <p style={{ color: '#b9a6a2', marginBottom: '2rem', textAlign: 'center' }}>Kamerani kompyuteringizdagi QR kodga qarating.</p>
      
      <div style={{ 
        width: '100%', 
        height: '300px', 
        border: '2px dashed #8a1200', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {hasCamera ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ color: '#ed5555', textAlign: 'center', padding: '1rem' }}>
            <i className="fa-solid fa-camera-slash" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
      
      <button onClick={onBack} style={{ marginTop: '2rem', backgroundColor: 'transparent', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        Orqaga qaytish
      </button>
    </div>
  );
}


// ==========================================
// ASOSIY LOGIN SAHIFASI
// ==========================================
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const isMobileScanMode = searchParams.get('mobileScan') === 'true';
  
  const { success, error: toastError } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [qrToken, setQrToken] = useState('fuzz_qr_' + Math.random().toString(36).substring(7));
  useEffect(() => {
    const interval = setInterval(() => {
      setQrToken('fuzz_qr_' + Math.random().toString(36).substring(7));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const qrUrl = `https://fuzz-tau.vercel.app/qr-auth?token=${qrToken}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!form.username || !form.password) {
      setApiError("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setLoading(true);
    try {
      await login(form);
      success('Tizimga muvaffaqiyatli kirdingiz!');
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' },
    box: { backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', width: '100%', maxWidth: '800px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
    body: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', padding: '2rem', gap: '2rem' },
    formSide: { flex: '1 1 300px', display: 'flex', flexDirection: 'column' },
    qrSide: { flex: '0 1 280px', borderLeft: isMobile ? 'none' : '1px solid #48201a', borderTop: isMobile ? '1px solid #48201a' : 'none', paddingLeft: isMobile ? '0' : '2rem', paddingTop: isMobile ? '2rem' : '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    title: { color: '#8a1200', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontWeight: '700' },
    input: { width: '100%', padding: '0.8rem 1rem', backgroundColor: '#100b0a', border: '1px solid #48201a', borderRadius: '4px', color: '#f5eeee', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' },
    errorBox: { backgroundColor: 'rgba(237, 85, 85, 0.1)', border: '1px solid #ed5555', padding: '0.8rem', borderRadius: '4px', color: '#ed5555', marginBottom: '1rem', fontSize: '0.85rem' },
    btnPrimary: { width: '100%', padding: '0.8rem', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', background: 'linear-gradient(90deg, #8a1200 0%, #3d0500 100%)' },
    footer: { backgroundColor: '#19100e', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #48201a', fontSize: '0.85rem', color: '#b9a6a2' }
  };

  // Agar mobil QR skaner rejimi bo'lsa, faqat kamerani ko'rsatamiz
  if (isMobileScanMode && isMobile) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.box}>
           <MobileQRScanner onBack={() => navigate('/login')} />
        </div>
      </div>
    );
  }

  // Standart Login sahifasi
  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <div style={styles.body}>
          
          <div style={styles.formSide}>
            <h3 style={styles.title}>SIGN IN WITH ACCOUNT NAME</h3>
            {apiError && <div style={styles.errorBox}>{apiError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="text" style={styles.input} placeholder="Account Name (Username)" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="password" style={styles.input} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', color: '#b9a6a2', fontSize: '0.85rem' }}>
                <input type="checkbox" id="remember" style={{ accentColor: '#8a1200' }} />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              <Link to="/reset-password" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Forgot password?</Link>
            </div>
          </div>

          <div style={styles.qrSide}>
            <h3 style={styles.title}>OR SIGN IN WITH QR</h3>
            <QRBoundary>
              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <QRCodeSVG value={qrUrl} size={150} />
              </div>
            </QRBoundary>
            <p style={{ fontSize: '0.8rem', color: '#b9a6a2', textAlign: 'center', lineHeight: 1.4 }}>
              Open <strong>Fuzz</strong> on your phone, tap the QR button and scan this code.
            </p>
          </div>

        </div>

        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={{ color: '#8a1200', fontWeight: '600', textDecoration: 'underline' }}>Create a Free Account</Link>
        </div>
      </div>
    </div>
  );
}
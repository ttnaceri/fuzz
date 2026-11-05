import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function QrScannerPage() {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  // Kamera oqimini ishga tushirish
  useEffect(() => {
    let stream = null;
    let detectorInterval = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);

        // BarcodeDetector mavjud bo'lsa, avtomatik skanerlash
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          detectorInterval = setInterval(async () => {
            if (!videoRef.current) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const raw = barcodes[0].rawValue;
                handleDetectedToken(raw);
              }
            } catch { /* ignore */ }
          }, 800);
        }
      } catch (err) {
        console.error('Kamera xatosi:', err);
        setError(
          'Kamerani ochib bo\'lmadi. Iltimos, brauzer sozlamalarida kameraga ruxsat bering yoki QR kodni qo\'lda kiriting.'
        );
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (detectorInterval) clearInterval(detectorInterval);
    };
  }, []);

  const handleDetectedToken = async (raw) => {
    if (!isAuthenticated || !user) {
      toastError("Avval tizimga kiring (mobil ilovada).");
      return;
    }
    // QR ichida URL yoki token bo'lishi mumkin
    let token = raw;
    try {
      const url = new URL(raw);
      token = url.searchParams.get('token') || raw;
    } catch { /* raw is the token */ }

    try {
      await api.post('/api/auth/qr/scan', { token, userId: user.id });
      success("QR kod tasdiqlandi! Endi desktopda kirish avtomatik bo'ladi.");
      navigate('/account');
    } catch (err) {
      toastError(err.message || 'QR kodni tasdiqlashda xato');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleDetectedToken(manualToken.trim());
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '2rem 1rem', backgroundColor: '#100b0a' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#f5eeee', marginBottom: '1rem' }}>QR Skaner</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Kompyuteringizdagi QR kodni kameraga qarating.
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(237,85,85,0.1)', border: '1px solid #ed5555', padding: '0.8rem', borderRadius: '6px', color: '#ed5555', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ position: 'relative', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', marginBottom: '1rem' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {scanning && (
            <div style={{
              position: 'absolute', inset: '10%', border: '2px solid #43b581',
              borderRadius: '12px', pointerEvents: 'none',
            }} />
          )}
        </div>

        <div style={{ backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
          <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Kamera ishlamasa, QR koddagi tokenni qo'lda kiriting:
          </p>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Token..."
              style={{ flex: 1, padding: '0.6rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}
            />
            <button type="submit" className="btn btn-primary">Tasdiqlash</button>
          </form>
        </div>

        {!isAuthenticated && (
          <p style={{ color: '#f0b44d', fontSize: '0.85rem', marginTop: '1rem' }}>
            Diqqat: skanerlash uchun avval mobil ilovada tizimga kiring.
          </p>
        )}
      </div>
    </div>
  );
}
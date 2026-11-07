import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsQR from 'jsqr';
import useToast from '../hooks/useToast.js';

const TOKEN_RE = /^[a-f0-9]{64}$/;
const ALLOWED_ORIGINS = new Set([
  'fuzz-tau.vercel.app',
  'localhost',
]);

function parseFuzzQrPayload(raw) {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let url;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!ALLOWED_ORIGINS.has(url.hostname)) return null;
  // Production'da faqat https
  if (url.hostname !== 'localhost' && url.protocol !== 'https:') return null;
  if (url.pathname !== '/qr-auth') return null;
  const token = url.searchParams.get('token') || '';
  if (!TOKEN_RE.test(token)) return null;
  return token;
}

export default function QrScannerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanningRef = useRef(true);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  useEffect(() => {
    scanningRef.current = true;
    let cancelled = false;

    const cleanup = () => {
      scanningRef.current = false;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch {} });
        streamRef.current = null;
      }
    };

    const handleDecoded = (raw) => {
      const token = parseFuzzQrPayload(raw);
      if (!token) {
        // Fuzz QR emas — skanerlash davom etadi
        toastError("Bu Fuzz saytiga tegishli QR kod emas!");
        return false; // continue scanning
      }
      // Muvaffaqiyat — skanni to'xtatamiz
      scanningRef.current = false;
      cleanup();
      navigate(`/qr-auth?token=${token}`, { replace: false });
      return true;
    };

    const tick = () => {
      if (!scanningRef.current || cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code?.data) {
            const stopped = handleDecoded(code.data);
            if (stopped) return;
          }
        }
      }
      if (scanningRef.current && !cancelled) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const startCamera = async () => {
      if (!window.isSecureContext) {
        setError("Kamera faqat HTTPS orqali ishlaydi. Iltimos, saytni https:// orqali oching.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Brauzeringiz kamerani qo'llab-quvvatlamaydi.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) { stream.getTracks().forEach(t => t.stop()); return; }
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        await video.play().catch(() => {});
        setCameraReady(true);
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setError("Kameraga ruxsat berilmadi. Brauzer sozlamalarida kamera ruxsatini bering va sahifani yangilang.");
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setError("Kamera topilmadi. Qurilmada kamera borligini tekshiring.");
        } else if (name === 'NotReadableError') {
          setError("Kamera boshqa dastur tomonidan band. Boshqa ilovalarni yoping va qayta urinib ko'ring.");
        } else {
          setError(err?.message || "Kamerani ochishda xato.");
        }
      }
    };

    startCamera();

    return cleanup;
    // MUHIM: dependency faqat navigate va toastError — scanningRef orqali boshqariladi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#100b0a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      <h2 style={{ color: '#f5eeee', marginBottom: '1rem' }}>QR Skaner</h2>
      <p style={{ color: '#b9a6a2', marginBottom: '2rem', textAlign: 'center', maxWidth: '300px' }}>
        Kamerani kompyuteringizdagi Fuzz QR kodiga qarating.
      </p>

      {error ? (
        <div style={{ color: '#ed5555', backgroundColor: 'rgba(237,85,85,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ed5555', maxWidth: '360px', textAlign: 'center' }}>
          <i className="fa-solid fa-camera-slash" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
          {error}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '2px solid #48201a', backgroundColor: '#000' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraReady ? 'block' : 'none' }}
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {!cameraReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b9a6a2' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: '15%', border: '2px solid #8a1200', borderRadius: '8px', pointerEvents: 'none' }}></div>
        </div>
      )}

      <Link
        to="/login"
        style={{ marginTop: '2rem', padding: '0.8rem 2rem', backgroundColor: '#48201a', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
      >
        Orqaga qaytish
      </Link>
    </div>
  );
}
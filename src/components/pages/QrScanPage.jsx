import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsQR from 'jsqr';

const TOKEN_RE = /^[a-f0-9]{64}$/;

// QR ichidagi matndan login tokenini ajratib olish (faqat /qr-auth?token=... ko'rinishidagi kodlar)
export function extractQrToken(text) {
  try {
    const url = new URL(String(text).trim());
    if (!/\/qr-auth\/?$/.test(url.pathname)) return null;
    const token = url.searchParams.get('token');
    return token && TOKEN_RE.test(token) ? token : null;
  } catch {
    return null;
  }
}

function decodeFromCanvas(canvas, ctx, source, w, h) {
  // Katta rasmlarni kichraytiramiz — jsQR tezroq ishlaydi
  const scale = Math.min(1, 800 / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
}

export default function QrScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | scanning | no-camera | denied | insecure
  const [hint, setHint] = useState('');

  const handleResult = (text) => {
    const token = extractQrToken(text);
    if (!token) {
      setHint("This is not a Fuzz sign-in QR code.");
      return false;
    }
    navigate(`/qr-auth?token=${token}`, { replace: true });
    return true;
  };
  const handleResultRef = useRef(handleResult);
  handleResultRef.current = handleResult;

  useEffect(() => {
    let stream = null;
    let rafId = 0;
    let stopped = false;
    let lastScan = 0;

    if (!window.isSecureContext) {
      setStatus('insecure');
      return undefined;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('no-camera');
      return undefined;
    }

    const tick = (now) => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && now - lastScan > 200) {
        lastScan = now;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const code = decodeFromCanvas(canvas, ctx, video, video.videoWidth, video.videoHeight);
        if (code?.data && handleResultRef.current(code.data)) return;
      }
      rafId = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(async (s) => {
        if (stopped) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        const video = videoRef.current;
        video.srcObject = s;
        await video.play().catch(() => {});
        setStatus('scanning');
        rafId = requestAnimationFrame(tick);
      })
      .catch((err) => {
        setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'no-camera');
      });

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Kamera ishlamasa — rasmga olib yuklash (iOS/HTTP holatlarida ham ishlaydi)
  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const code = decodeFromCanvas(canvas, ctx, img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      if (!code?.data) { setHint("Couldn't find a QR code in the photo. Try again closer."); return; }
      handleResult(code.data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setHint("Couldn't read the image."); };
    img.src = url;
  };

  const messages = {
    insecure: 'Camera access requires HTTPS. Take a photo of the QR code instead.',
    'no-camera': 'Camera is not available. Take a photo of the QR code instead.',
    denied: 'Camera permission was denied. Allow it in browser settings or take a photo instead.',
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 6rem', color: '#f5eeee' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Sign in on another device</h2>
      <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Open the Fuzz sign-in page on your computer and point the camera at the QR code.
      </p>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#000', borderRadius: 8, overflow: 'hidden', border: '1px solid #48201a' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: status === 'scanning' ? 'block' : 'none' }} />
        {status === 'scanning' && (
          <div style={{ position: 'absolute', inset: '15%', border: '3px solid #8a1200', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
        )}
        {status === 'starting' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
          </div>
        )}
        {messages[status] && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', color: '#b9a6a2' }}>
            {messages[status]}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {hint && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
          {hint}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', border: '1px solid #48201a', borderRadius: 4, background: '#241411', color: '#f5eeee', fontSize: '1rem', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-camera" style={{ marginRight: '0.5rem' }} />Take a photo of the QR code
      </button>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#b9a6a2', fontSize: '0.85rem' }}>Cancel</Link>
      </div>
    </div>
  );
}

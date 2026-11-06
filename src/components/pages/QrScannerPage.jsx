import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import useToast from '../hooks/useToast.js';

export default function QrScannerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  useEffect(() => {
    let stream = null;
    let animationFrameId = null;

    const startCamera = async () => {
      try {
        // Kamerani orqa kameraga yo'naltirish
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true); // iOS uchun muhim
          await videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Kamera xatosi:", err);
        setError("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code && code.data) {
              handleQrCode(code.data);
              return; // Skanni to'xtatamiz
            }
          }
        }
      }
      if (scanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handleQrCode = (data) => {
      setScanning(false);
      // QR kod ichidagi matnni tekshirish (sizning saytingiz URL manzili bo'lishi kerak)
      // Masalan: https://fuzz-tau.vercel.app/qr-auth?token=12345
      if (data.includes('fuzz-tau.vercel.app') || data.includes('/qr-auth')) {
        // Muvaffaqiyatli skanerlandi!
        // Bu yerda tokenni ajratib olishingiz mumkin, hozircha login sahifasiga yo'naltiramiz
        window.location.href = data; 
      } else {
        toastError("Bu Fuzz saytiga tegishli QR kod emas!");
        setScanning(true); // Qayta skanerlashni davom ettirish
        requestAnimationFrame(tick);
      }
    };

    startCamera();

    // Tozalash
    return () => {
      setScanning(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate, toastError, scanning]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#100b0a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      <h2 style={{ color: '#f5eeee', marginBottom: '1rem' }}>QR Skaner</h2>
      <p style={{ color: '#b9a6a2', marginBottom: '2rem', textAlign: 'center', maxWidth: '300px' }}>
        Kamerani kompyuteringizdagi Fuzz QR kodiga qarating.
      </p>

      {error ? (
        <div style={{ color: '#ed5555', backgroundColor: 'rgba(237,85,85,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ed5555' }}>
          {error}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '2px solid #48201a', backgroundColor: '#000' }}>
          <video 
            ref={videoRef} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Skanerlash ramkasi (chiroyli ko'rinish uchun) */}
          <div style={{ position: 'absolute', inset: '15%', border: '2px solid #8a1200', borderRadius: '8px', pointerEvents: 'none' }}></div>
        </div>
      )}

      <button 
        onClick={() => navigate(-1)} 
        style={{ marginTop: '2rem', padding: '0.8rem 2rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Orqaga qaytish
      </button>
    </div>
  );
}
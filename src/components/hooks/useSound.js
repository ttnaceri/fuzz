import { useEffect, useRef } from 'react';

// Brauzer autoplay siyosatini chetlab o'tish uchun global flag
let isUnlocked = false;

export function useSound() {
  const audioRef = useRef(null);

  useEffect(() => {
    // Audio obyektini yaratamiz
    audioRef.current = new Audio('/sound/notification.mp3');
    
    // Foydalanuvchi birinchi marta bosganda ovozni "ochamiz"
    const unlockAudio = () => {
      isUnlocked = true;
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.volume = 0.5;
        }).catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const playNotification = () => {
    if (!isUnlocked || !audioRef.current) return;
    audioRef.current.currentTime = 0; // Boshidan boshlash
    audioRef.current.play().catch((e) => console.warn('Audio play failed:', e));
  };

  return { playNotification };
}
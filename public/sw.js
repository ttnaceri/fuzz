// Service Worker minimal versiyasi
// Hozircha u faqat PWA o'rnatilishini ta'minlash uchun kerak.
// Keyinchalik bu yerga offline rejim (caching) qo'shilishi mumkin.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Hozircha barcha so'rovlarni shunchaki tarmoqqa yuboramiz
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Siz hozir offline rejimdasiz. Internet aloqasini tekshiring.');
  }));
});
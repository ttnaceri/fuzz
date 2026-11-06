// src/utils/password.js
// Format: pbkdf2$<iterations>$<saltB64>$<hashB64>
// Eski (ochiq matndagi) parollar loginda tekshiriladi va darhol hash'ga o'tkaziladi.
const PREFIX = 'pbkdf2';
const ITERATIONS = 100000; // Cloudflare Workers'da PBKDF2 uchun maksimal qiymat

const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromB64 = (str) => Uint8Array.from(atob(str), (ch) => ch.charCodeAt(0));

async function derive(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function isHashed(stored) {
  return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

// { ok, needsRehash } — needsRehash=true bo'lsa, parol hali ochiq matnda saqlangan
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string' || !stored) {
    return { ok: false, needsRehash: false };
  }
  if (!isHashed(stored)) {
    const enc = new TextEncoder();
    const ok = timingSafeEqual(enc.encode(password), enc.encode(stored));
    return { ok, needsRehash: ok };
  }
  try {
    const [, iterStr, saltB64, hashB64] = stored.split('$');
    const iterations = parseInt(iterStr, 10);
    const hash = await derive(password, fromB64(saltB64), iterations);
    return { ok: timingSafeEqual(hash, fromB64(hashB64)), needsRehash: iterations !== ITERATIONS };
  } catch {
    return { ok: false, needsRehash: false };
  }
}

// Telegram/konsol orqali yaratilgan akkauntlar uchun — hech kim bilmaydigan parol
export async function randomPasswordHash() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return hashPassword(toB64(bytes));
}

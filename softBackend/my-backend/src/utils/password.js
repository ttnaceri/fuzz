// src/utils/password.js
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  return `${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...new Uint8Array(hash)))}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltB64, hashB64] = storedHash.split(':');
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const originalHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));
  
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  
  const newHash = new Uint8Array(hash);
  if (newHash.length !== originalHash.length) return false;
  return newHash.every((val, i) => val === originalHash[i]);
}
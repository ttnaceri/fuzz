// src/components/services/fileSystemService.js

const DB_NAME = 'fuzz_filesystem_db';
const STORE_NAME = 'handles';

// IndexedDB ni ochish
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Papka tutqichini saqlash
async function saveDirectoryHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, 'fuzzDirectory');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Papka tutqichini olish
async function getDirectoryHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('fuzzDirectory');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Ruxsatni tekshirish
async function verifyPermission(handle, readWrite = true) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export const fileSystemService = {
  // Foydalanuvchiga papka tanlashni taklif qilish
  async selectDirectory() {
    if (!window.showDirectoryPicker) {
      throw new Error("Brauzeringiz File System Access API ni qo'llab-quvvatlamaydi. Iltimos, Chrome, Edge yoki Opera brauzeridan foydalaning.");
    }
    
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });
      
      // Ruxsatni tasdiqlash
      const hasPermission = await verifyPermission(handle);
      if (!hasPermission) {
        throw new Error("Papkaga yozish ruxsati berilmadi.");
      }
      
      // Papkani saqlash
      await saveDirectoryHandle(handle);
      
      // Fuzz uchun kerakli ichki papkalarni yaratish
      await handle.getDirectoryHandle('games', { create: true });
      await handle.getDirectoryHandle('data', { create: true });
      await handle.getDirectoryHandle('logs', { create: true });
      
      return handle;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error("Papka tanlash bekor qilindi.");
      }
      throw err;
    }
  },

  // Saqlangan papkani olish
  async getSavedDirectory() {
    const handle = await getDirectoryHandle();
    if (!handle) return null;
    
    // Ruxsatni tekshirish (foydalanuvchi sahifani yangilaganda ruxsat qayta so'raladi)
    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) return null;
    
    return handle;
  },

  // O'yin faylini saqlash (masalan, o'yin ma'lumotlari)
  async saveGameFile(gameId, fileName, content) {
    const handle = await this.getSavedDirectory();
    if (!handle) throw new Error("Fuzz papkasi topilmadi. Iltimos, qayta tanlang.");
    
    const gamesDir = await handle.getDirectoryHandle('games', { create: true });
    const gameDir = await gamesDir.getDirectoryHandle(gameId, { create: true });
    const fileHandle = await gameDir.getFileHandle(fileName, { create: true });
    
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  },

  // O'yin faylini o'qish
  async readGameFile(gameId, fileName) {
    const handle = await this.getSavedDirectory();
    if (!handle) throw new Error("Fuzz papkasi topilmadi.");
    
    try {
      const gamesDir = await handle.getDirectoryHandle('games');
      const gameDir = await gamesDir.getDirectoryHandle(gameId);
      const fileHandle = await gameDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (err) {
      return null; // Fayl topilmasa
    }
  }
};
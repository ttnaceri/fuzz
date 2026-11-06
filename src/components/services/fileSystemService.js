const DB_NAME = 'fuzz_filesystem_db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'fuzzDirectory';

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

async function saveDirectoryHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getDirectoryHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function verifyPermission(handle, readWrite = true) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  if ((await handle.requestPermission(options)) === 'granted') return true;
  return false;
}

export const fileSystemService = {
  async selectDirectory() {
    if (!window.showDirectoryPicker) {
      throw new Error("Brauzeringiz File System Access API ni qo'llab-quvvatlamaydi.");
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });
      const hasPermission = await verifyPermission(handle);
      if (!hasPermission) {
        throw new Error("Papkaga yozish ruxsati berilmadi.");
      }
      await saveDirectoryHandle(handle);
      
      // Fuzz uchun kerakli papkalarni yaratish
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

  async getSavedDirectory() {
    try {
      const handle = await getDirectoryHandle();
      if (!handle) return null;
      const hasPermission = await verifyPermission(handle);
      if (!hasPermission) return null;
      return handle;
    } catch {
      return null;
    }
  },

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

  async readGameFile(gameId, fileName) {
    const handle = await this.getSavedDirectory();
    if (!handle) throw new Error("Fuzz papkasi topilmadi.");
    try {
      const gamesDir = await handle.getDirectoryHandle('games');
      const gameDir = await gamesDir.getDirectoryHandle(gameId);
      const fileHandle = await gameDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }
};
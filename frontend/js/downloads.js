/* ============================================================
   FUZZ — downloads.js (Steam-style Download Manager)
   O'yinni orqa fonda "yuklab olish" simulyatsiyasi.
   ============================================================ */

(function () {
    "use strict";

    const LS_KEY = "fuzz_downloads";
    let downloadInterval = null;

    // Holatni olish
    function getDownloads() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        } catch { return {}; }
    }

    // Holatni saqlash
    function saveDownloads(data) {
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("fuzz:downloads-updated"));
    }

    // O'yinni o'rnatishni boshlash
    function startDownload(gameId) {
        const downloads = getDownloads();
        if (downloads[gameId] && downloads[gameId].status === "downloading") return;

        downloads[gameId] = {
            id: gameId,
            progress: 0,
            speed: 0,
            status: "downloading", // downloading, paused, completed
            size: Math.floor(Math.random() * 5000) + 1000, // 1GB - 6GB
            downloaded: 0
        };
        saveDownloads(downloads);
        tick();
    }

    // Pause / Resume
    function togglePause(gameId) {
        const downloads = getDownloads();
        if (!downloads[gameId]) return;

        if (downloads[gameId].status === "downloading") {
            downloads[gameId].status = "paused";
            downloads[gameId].speed = 0;
        } else if (downloads[gameId].status === "paused") {
            downloads[gameId].status = "downloading";
        }
        saveDownloads(downloads);
    }

    // O'chirish (bekor qilish)
    function cancelDownload(gameId) {
        const downloads = getDownloads();
        delete downloads[gameId];
        saveDownloads(downloads);
    }

    // Simulyatsiya taymeri
    function tick() {
        if (downloadInterval) return;

        downloadInterval = setInterval(() => {
            const downloads = getDownloads();
            let hasActive = false;

            Object.keys(downloads).forEach(id => {
                const dl = downloads[id];
                if (dl.status === "downloading") {
                    hasActive = true;
                    // Tasodifiy tezlik (2 MB/s dan 15 MB/s gacha)
                    const currentSpeed = (Math.random() * 13 + 2).toFixed(1);
                    dl.speed = parseFloat(currentSpeed);
                    
                    // Necha MB yuklandi (1 sekundda)
                    const mbPerSec = (dl.speed * 1024 * 1024);
                    dl.downloaded += mbPerSec;

                    // Foizni hisoblash
                    const totalBytes = dl.size * 1024 * 1024;
                    dl.progress = Math.min(100, Math.floor((dl.downloaded / totalBytes) * 100));

                    if (dl.progress >= 100) {
                        dl.status = "completed";
                        dl.speed = 0;
                        if (window.FuzzToast) FuzzToast.success(`Game installed successfully!`);
                    }
                }
            });

            saveDownloads(downloads);

            // Agar aktiv yuklanishlar bo'lmasa, taymerni to'xtatamiz
            if (!hasActive) {
                clearInterval(downloadInterval);
                downloadInterval = null;
            }
        }, 1000);
    }

    // Sahifa ochilganda ishlashni davom ettirish
    function init() {
        const downloads = getDownloads();
        const hasActive = Object.values(downloads).some(d => d.status === "downloading");
        if (hasActive) tick();
    }

    // Global API
    window.FuzzDownloads = {
        getDownloads,
        startDownload,
        togglePause,
        cancelDownload
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

})();
/* ============================================================
   FUZZ — toast.js
   Toast / Notification tizimi
   - sound/notification.mp3 har bir toast uchun BIR MARTA chalinadi
   - 4 tur: success | error | warning | info
   - Auto-dismiss + qo'lda yopish
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Sozlamalar ---------- */
    const DEFAULT_DURATION = 3000;   // ms
    const SOUND_PATH       = "sound/notification.mp3";
    const SOUND_VOLUME     = 0.5;

    /* ---------- Holat ---------- */
    let container      = null;
    let audio          = null;
    let audioUnlocked  = false;

    /* ---------- Icon map ---------- */
    const ICONS = {
        success: "fa-solid fa-circle-check",
        error:   "fa-solid fa-circle-xmark",
        warning: "fa-solid fa-triangle-exclamation",
        info:    "fa-solid fa-circle-info"
    };


    /* ==========================================================
       1. AUDIO — notification.mp3 bir marta chalish
       ========================================================== */

    function initAudio() {
        if (audio) return;
        audio = new Audio(SOUND_PATH);
        audio.volume = SOUND_VOLUME;
        audio.preload  = "auto";

        // Brauzer autoplay siyosati uchun: birinchi klik/hover'da unlock
        const unlock = () => {
            if (audioUnlocked) return;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audioUnlocked = true;
                removeUnlockListeners();
            }).catch(() => { /* jim */ });
        };

        const removeUnlockListeners = () => {
            document.removeEventListener("click", unlock);
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("keydown", unlock);
        };

        document.addEventListener("click", unlock,      { once: false });
        document.addEventListener("touchstart", unlock, { once: false });
        document.addEventListener("keydown", unlock,    { once: false });
    }

    function playNotificationSound() {
        if (!audio) return;
        try {
            // Har bir toast uchun yangi instance — bir vaqtda bir nechta chalishi mumkin
            const snd = audio.cloneNode();
            snd.volume = SOUND_VOLUME;
            snd.play().catch(() => { /* autoplay bloklangan */ });
        } catch (e) {
            /* jim */
        }
    }


    /* ==========================================================
       2. CONTAINER
       ========================================================== */

    function getContainer() {
        if (container && document.body.contains(container)) return container;

        container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            container.setAttribute("aria-live", "polite");
            container.setAttribute("aria-atomic", "false");
            document.body.appendChild(container);
        }
        return container;
    }


    /* ==========================================================
       3. MATNNI TARJIMA QILISH
       ========================================================== */

    function resolveMessage(message) {
        if (typeof message !== "string") return String(message);

        // Agar FuzzLang mavjud bo'lsa va kalit tarjimada bo'lsa — tarjima qilamiz
        if (window.FuzzLang && window.FuzzLang.translations[message]) {
            return window.FuzzLang.t(message);
        }
        return message;
    }


    /* ==========================================================
       4. ASOSIY TOAST FUNKSIYASI
       ========================================================== */

    function showToast(message, type = "info", duration = DEFAULT_DURATION) {
        const c   = getContainer();
        const msg = resolveMessage(message);

        // Sound — BIR MARTA
        playNotificationSound();

        // Toast element
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        // Icon
        const icon = document.createElement("div");
        icon.className = "toast-icon";
        const i = document.createElement("i");
        i.className = ICONS[type] || ICONS.info;
        i.setAttribute("aria-hidden", "true");
        icon.appendChild(i);

        // Message
        const text = document.createElement("div");
        text.className = "toast-message";
        text.textContent = msg;

        // Close btn
        const close = document.createElement("button");
        close.type = "button";
        close.className = "toast-close";
        close.setAttribute("aria-label", "Close");
        close.innerHTML = '<i class="fa-solid fa-xmark"></i>';

        toast.appendChild(icon);
        toast.appendChild(text);
        toast.appendChild(close);
        c.appendChild(toast);

        // Yopish funksiyasi
        let dismissed = false;
        const dismiss = () => {
            if (dismissed) return;
            dismissed = true;
            toast.classList.add("hide");
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        };

        close.addEventListener("click", dismiss);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(dismiss, duration);
        }

        return { dismiss, element: toast };
    }


    /* ==========================================================
       5. QULAYLIK METODLARI
       ========================================================== */

    const toast = {
        success: (msg, duration) => showToast(msg, "success", duration),
        error:   (msg, duration) => showToast(msg, "error",   duration),
        warning: (msg, duration) => showToast(msg, "warning", duration),
        info:    (msg, duration) => showToast(msg, "info",    duration),
        show:    showToast,

        // Barcha toastlarni tozalash
        clear: () => {
            const c = getContainer();
            c.querySelectorAll(".toast").forEach(t => {
                t.classList.add("hide");
                setTimeout(() => t.remove(), 300);
            });
        }
    };


    /* ==========================================================
       6. PUBLIC API
       ========================================================== */

    window.FuzzToast = toast;

    // Global qulaylik: window.toast(...)
    window.toast = toast;


    /* ==========================================================
       7. INIT
       ========================================================== */

    function init() {
        getContainer();
        initAudio();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
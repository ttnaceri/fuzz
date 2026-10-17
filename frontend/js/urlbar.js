/* ============================================================
   FUZZ — urlbar.js
   URL Indicator Bar
   - Refresh tugmasi (⟳)
   - Lock icon (🔒) + readonly URL input
   - Copy tugmasi (nusxalashda notification.mp3 chalinadi)
   - Ctrl+R / Cmd+R → refresh
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Sozlamalar ---------- */
    const SOUND_PATH   = "sound/notification.mp3";
    const SOUND_VOLUME = 0.4;
    const COPY_RESET_MS = 1500;

    /* ---------- Elementlar ---------- */
    let refreshBtn = null;
    let copyBtn    = null;
    let urlInput   = null;
    let lockIcon   = null;

    /* ---------- Audio (copy uchun) ---------- */
    let audio = null;

    function initAudio() {
        if (audio) return;
        audio = new Audio(SOUND_PATH);
        audio.volume  = SOUND_VOLUME;
        audio.preload = "auto";
    }

    function playCopySound() {
        if (!audio) return;
        try {
            const snd = audio.cloneNode();
            snd.volume = SOUND_VOLUME;
            snd.play().catch(() => { /* autoplay bloklangan */ });
        } catch (e) { /* jim */ }
    }


    /* ==========================================================
       1. URL'NI ANIQLASH VA O'RNATISH
       ========================================================== */

    function setURL() {
        if (!urlInput) return;

        // Prioritet: data-url > window.location.href
        const override = urlInput.getAttribute("data-url");
        const url = override || window.location.href;

        urlInput.value = url;
        urlInput.setAttribute("title", url);
    }


    /* ==========================================================
       2. REFRESH
       ========================================================== */

    function doRefresh() {
        // Animatsiya
        if (refreshBtn) {
            refreshBtn.classList.add("spinning");
            setTimeout(() => refreshBtn.classList.remove("spinning"), 600);
        }
        // Sahifani yangilash
        window.location.reload();
    }


    /* ==========================================================
       3. COPY
       ========================================================== */

    async function doCopy() {
        if (!urlInput) return;
        const url = urlInput.value || window.location.href;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback — eski brauzerlar uchun
                urlInput.removeAttribute("readonly");
                urlInput.select();
                urlInput.setSelectionRange(0, 99999);
                document.execCommand("copy");
                urlInput.setAttribute("readonly", "readonly");
                urlInput.blur();
            }

            // Sound — BIR MARTA
            playCopySound();

            // Feedback
            showCopyFeedback();

            // Toast
            if (window.FuzzToast) {
                window.FuzzToast.success("urlbar_copied", 1500);
            }
        } catch (err) {
            if (window.FuzzToast) {
                window.FuzzToast.error("toast_error", 2000);
            }
        }
    }

    function showCopyFeedback() {
        if (!copyBtn) return;
        const originalIcon = '<i class="fa-regular fa-copy"></i>';
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-success"></i>';
        copyBtn.classList.add("copied");

        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.classList.remove("copied");
        }, COPY_RESET_MS);
    }


    /* ==========================================================
       4. CTRL+R / CMD+R
       ========================================================== */

    function handleKeydown(e) {
        const isRefreshCombo =
            (e.ctrlKey || e.metaKey) &&
            !e.shiftKey &&
            (e.key === "r" || e.key === "R");

        if (isRefreshCombo) {
            // Brauzerning default reload'ini bloklaymiz va o'zimiznikini ishlatamiz
            e.preventDefault();
            doRefresh();
        }
    }


    /* ==========================================================
       5. LOCK ICON HOLATI (http vs https)
       ========================================================== */

    function updateLockIcon() {
        if (!lockIcon) return;
        const isSecure = window.location.protocol === "https:" ||
                         window.location.hostname === "localhost" ||
                         window.location.protocol === "file:";
        lockIcon.className = isSecure
            ? "fa-solid fa-lock urlbar-lock"
            : "fa-solid fa-lock-open urlbar-lock";

        if (window.FuzzLang) {
            lockIcon.setAttribute("title", isSecure
                ? window.FuzzLang.t("urlbar_secure")
                : "Not secure");
        }
    }


    /* ==========================================================
       6. INIT
       ========================================================== */

    function init() {
        refreshBtn = document.getElementById("urlbar-refresh");
        copyBtn    = document.getElementById("urlbar-copy");
        urlInput   = document.getElementById("urlbar-input");
        lockIcon   = document.querySelector(".urlbar-lock");

        if (!refreshBtn || !copyBtn || !urlInput) {
            console.warn("[urlbar.js] URL bar elementlari topilmadi.");
            return;
        }

        initAudio();
        setURL();
        updateLockIcon();

        // Eventlar
        refreshBtn.addEventListener("click", doRefresh);
        copyBtn.addEventListener("click", doCopy);
        document.addEventListener("keydown", handleKeydown);

        // SPA route o'zgarsa URL'ni yangilash
        window.addEventListener("popstate", setURL);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }


    /* ==========================================================
       7. PUBLIC API
       ========================================================== */

    window.FuzzURLBar = {
        refresh: doRefresh,
        copy:    doCopy,
        setURL,
        updateLockIcon
    };

})();
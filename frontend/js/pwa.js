/* ============================================================
   FUZZ — pwa.js (v2)
   Service Worker, install prompt, online/offline
   ============================================================ */

(function () {
    "use strict";

    let deferredPrompt = null;
    let swRegistration = null;
    const SW_PATH = "service-worker.js";


    /* ==========================================================
       1. SERVICE WORKER
       ========================================================== */

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        if (location.protocol !== "http:" && location.protocol !== "https:") {
            console.warn("[pwa.js] SW faqat http(s) da ishlaydi.");
            return;
        }

        try {
            swRegistration = await navigator.serviceWorker.register(SW_PATH, { scope: "./" });
            console.info("[pwa.js] SW ro'yxatdan o'tdi:", swRegistration.scope);

            swRegistration.addEventListener("updatefound", () => {
                const nw = swRegistration.installing;
                if (!nw) return;
                nw.addEventListener("statechange", () => {
                    if (nw.state === "installed" && navigator.serviceWorker.controller) {
                        notifyUpdate(nw);
                    }
                });
            });

            let refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });
        } catch (err) {
            console.warn("[pwa.js] SW xatosi:", err);
        }
    }

    function notifyUpdate(worker) {
        if (!window.FuzzToast) return;
        const toast = FuzzToast.info("New version available. Click to update.", 0);
        const el = toast.element;
        if (el) {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
                worker.postMessage({ type: "SKIP_WAITING" });
                toast.dismiss();
            });
        }
    }


    /* ==========================================================
       2. INSTALL PROMPT
       ========================================================== */

    function bindInstallPrompt() {
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.info("[pwa.js] Install prompt tayyor.");
            showInstallButton();
        });

        window.addEventListener("appinstalled", () => {
            deferredPrompt = null;
            hideInstallButton();
            if (window.FuzzToast) FuzzToast.success("Fuzz installed successfully!");
        });
    }

    function showInstallButton() {
        const actions = document.querySelector(".navbar-actions");
        if (!actions || document.getElementById("pwa-install-btn")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "pwa-install-btn";
        btn.className = "navbar-icon";
        btn.setAttribute("aria-label", "Install app");
        btn.innerHTML = '<i class="fa-solid fa-download"></i>';
        btn.addEventListener("click", triggerInstall);
        actions.insertBefore(btn, actions.firstChild);
    }

    function hideInstallButton() {
        document.getElementById("pwa-install-btn")?.remove();
    }

    async function triggerInstall() {
        if (!deferredPrompt) {
            if (window.FuzzToast) FuzzToast.info("Install not available. Use your browser menu.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.info("[pwa.js] Install:", outcome);
        deferredPrompt = null;
        hideInstallButton();
    }


    /* ==========================================================
       3. ONLINE / OFFLINE
       ========================================================== */

    function bindOnlineOffline() {
        window.addEventListener("online", () => {
            if (window.FuzzToast) FuzzToast.success("toast_online");
        });
        window.addEventListener("offline", () => {
            if (window.FuzzToast) FuzzToast.warning("toast_offline", 5000);
        });
    }


    /* ==========================================================
       4. CACHE
       ========================================================== */

    function clearCache() {
        if (!navigator.serviceWorker.controller) return;
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
        if (window.FuzzToast) FuzzToast.info("Cache cleared.");
    }

    function checkForUpdate() {
        swRegistration?.update();
    }


    /* ==========================================================
       5. PUBLIC API
       ========================================================== */

    window.FuzzPWA = {
        install:      triggerInstall,
        clearCache,
        checkForUpdate,
        get canInstall() { return !!deferredPrompt; },
        get registration() { return swRegistration; }
    };


    /* ==========================================================
       6. INIT
       ========================================================== */

    function init() {
        registerServiceWorker();
        bindInstallPrompt();
        bindOnlineOffline();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
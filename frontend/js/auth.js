/* ============================================================
   FUZZ — auth.js
   Google OAuth (mock) + login/logout + session
   ============================================================ */

(function () {
    "use strict";

    const LS_USER = "fuzz_user";
    const LS_SESSION = "fuzz_session";

    // Google Client ID (config.example.js'dan olinadi)
    const GOOGLE_CLIENT_ID = ""; // <-- bu yerga qo'ying


    /* ==========================================================
       1. USER SAQLASH / OLISH
       ========================================================== */

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(LS_USER) || "null");
        } catch { return null; }
    }

    function setUser(user) {
        if (user) {
            localStorage.setItem(LS_USER, JSON.stringify(user));
            localStorage.setItem(LS_SESSION, Date.now().toString());
        } else {
            localStorage.removeItem(LS_USER);
            localStorage.removeItem(LS_SESSION);
        }
        updateNavbar();
    }

    function isLoggedIn() {
        return !!getUser();
    }


    /* ==========================================================
       2. NAVBAR'NI YANGILASH
       ========================================================== */

    function updateNavbar() {
        const user = getUser();
        const avatar = document.querySelector(".navbar-avatar");
        if (!avatar) return;

        if (user) {
            avatar.src = user.avatar || "image/logo.png";
            avatar.alt = user.name || "User";
        } else {
            avatar.src = "image/logo.png";
            avatar.alt = "Guest";
        }
    }


    /* ==========================================================
       3. GOOGLE OAUTH (mock / real)
       ========================================================== */

    function loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (window.google?.accounts) return resolve();
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function initGoogle() {
        if (!GOOGLE_CLIENT_ID) {
            console.info("[auth.js] Google Client ID yo'q — mock rejim.");
            return;
        }

        try {
            await loadGoogleScript();
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
        } catch (e) {
            console.warn("[auth.js] Google skript yuklanmadi:", e);
        }
    }

    function handleGoogleResponse(response) {
        // JWT'ni decode qilish (payload qismi)
        try {
            const payload = JSON.parse(atob(response.credential.split(".")[1]));
            const user = {
                sub:     payload.sub,          // Google unique ID
                user_id: "u_" + payload.sub.slice(-8), // ichki ID
                email:   payload.email,
                name:    payload.name,
                avatar:  payload.picture,
                role:    "User",
                status:  "active",
                created_at: new Date().toISOString()
            };
            setUser(user);
            if (window.FuzzToast) FuzzToast.success("toast_login_success");
        } catch (e) {
            console.error("[auth.js] Google response xatosi:", e);
            if (window.FuzzToast) FuzzToast.error("toast_error");
        }
    }

    function loginWithGoogle() {
        if (GOOGLE_CLIENT_ID && window.google?.accounts) {
            google.accounts.id.prompt();
        } else {
            // Mock rejim — demo foydalanuvchi
            mockLogin();
        }
    }

    function mockLogin() {
        const user = {
            sub:     "mock_123456",
            user_id: "u_mock123",
            email:   "demo@fuzz.store",
            name:    "Demo User",
            avatar:  "image/logo.png",
            role:    "User",
            status:  "active",
            created_at: new Date().toISOString()
        };
        setUser(user);
        if (window.FuzzToast) FuzzToast.success("toast_login_success");
        setTimeout(() => window.location.reload(), 800);
    }


    /* ==========================================================
       4. LOGOUT
       ========================================================== */

    function logout() {
        if (!confirm(window.FuzzLang ? FuzzLang.t("auth_logout_confirm") : "Log out?")) return;
        setUser(null);
        if (window.FuzzToast) FuzzToast.info("toast_logout");
        setTimeout(() => window.location.reload(), 600);
    }


    /* ==========================================================
       5. PUBLIC API
       ========================================================== */

    window.FuzzAuth = {
        getUser,
        setUser,
        isLoggedIn,
        loginWithGoogle,
        logout,
        mockLogin
    };


    /* ==========================================================
       6. INIT
       ========================================================== */

    function init() {
        updateNavbar();
        initGoogle();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
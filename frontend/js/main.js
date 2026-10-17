/* ============================================================
   FUZZ — main.js (v4 — PWA Splash Only)
   Umumiy init: Splash, Navbar, Profile Menu, Download Fuzz,
   Mobile Navbar
   ============================================================ */

(function () {
    "use strict";

    const CFG = window.FUZZ_CONFIG || {};
    const LS_KEYS = CFG.LS_KEYS || {};


    /* ==========================================================
       1. SPLASH (Faqat PWA / App uchun)
       ========================================================== */
    function initSplash() {
        const splash = document.getElementById("splash-screen");
        if (!splash) return;

        // PWA (Standalone) rejimida ishlayotganini tekshirish
        const isStandalone = 
            window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        // Agar oddiy brauzer bo'lsa — splash'ni yashiramiz va qaytamiz
        if (!isStandalone) {
            splash.style.display = "none";
            return;
        }

        const closeBtn = splash.querySelector(".splash-close");
        const username = document.getElementById("splash-username");
        const avatar   = document.getElementById("splash-avatar");

        // Foydalanuvchi ma'lumotlarini yuklash
        try {
            const user = JSON.parse(localStorage.getItem(LS_KEYS.user || "fuzz_user") || "null");
            if (user) {
                if (username) username.textContent = user.name || user.email || "User";
                if (avatar && user.avatar) avatar.src = user.avatar;
            } else {
                if (username) username.textContent = window.FuzzLang ? FuzzLang.t("splash_guest") : "Guest";
            }
        } catch { /* jim */ }

        // Yopish funksiyasi
        const dismiss = () => {
            splash.classList.add("hidden");
            // CSS klassidan tashqari majburiy yashirish (animatsiya tugagach)
            setTimeout(() => {
                splash.style.display = "none";
                splash.style.opacity = "0";
                splash.style.visibility = "hidden";
                splash.style.pointerEvents = "none";
            }, 400);
        };

        // Yopish tugmasi
        closeBtn?.addEventListener("click", dismiss);

        // 3 soniyadan keyin avtomatik yopilish
        setTimeout(dismiss, 3000);

        // 5 soniyadan keyin majburiy yopilish (agar biror xato bo'lsa)
        setTimeout(() => {
            if (splash && !splash.classList.contains("hidden")) {
                dismiss();
            }
        }, 5000);
    }


    /* ==========================================================
       2. NAVBAR TOGGLE (Mobil menyu)
       ========================================================== */
    function initNavbar() {
        const toggle = document.getElementById("navbar-toggle");
        const links  = document.querySelector(".navbar-links");
        if (!toggle || !links) return;

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            links.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (!links.classList.contains("open")) return;
            if (links.contains(e.target) || toggle.contains(e.target)) return;
            links.classList.remove("open");
        });

        links.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", () => links.classList.remove("open"));
        });
    }


    /* ==========================================================
       3. PROFIL DROPDOWN
       ========================================================== */
    function initProfileMenu() {
        const profile = document.getElementById("navbar-profile");
        if (!profile) return;

        // Dropdown HTML ini yaratish
        const dropdown = document.createElement("div");
        dropdown.className = "profile-dropdown";
        dropdown.id = "profile-dropdown";
        dropdown.innerHTML = `
            <a href="profile.html" data-i18n="nav_profile">Profile</a>
            <a href="library.html" data-i18n="nav_library">Library</a>
            <a href="wishlist.html" data-i18n="nav_wishlist">Wishlist</a>
            <a href="wallet.html" data-i18n="wallet_title">Wallet</a>
            <a href="downloads.html" data-i18n="downloads_title">Downloads</a>
            <a href="settings.html" data-i18n="settings_title">Settings</a>
            <hr>
            <div class="lang-switcher" id="lang-switcher"></div>
            <hr>
            <a href="#" id="logout-link" data-i18n="nav_logout">Log out</a>
        `;
        
        profile.parentNode.style.position = "relative";
        profile.parentNode.appendChild(dropdown);

        // Dropdown uchun CSS (agar sahifada yo'q bo'lsa)
        if (!document.getElementById("profile-dropdown-style")) {
            const style = document.createElement("style");
            style.id = "profile-dropdown-style";
            style.textContent = `
                .profile-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    min-width: 200px;
                    background: var(--color-bg-panel);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 8px;
                    display: none;
                    flex-direction: column;
                    gap: 2px;
                    z-index: 1200;
                    box-shadow: var(--shadow-lg);
                }
                .profile-dropdown.open { display: flex; }
                .profile-dropdown a {
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 14px;
                    color: var(--color-text);
                    text-decoration: none;
                }
                .profile-dropdown a:hover { background: var(--color-primary-dark); }
                .profile-dropdown hr { border: none; border-top: 1px solid var(--color-border); margin: 4px 0; }
                .profile-dropdown .lang-switcher { display: flex; gap: 4px; padding: 6px 8px; }
                .profile-dropdown .lang-option { flex: 1; height: 28px; font-size: 12px; }
            `;
            document.head.appendChild(style);
        }

        // Ochish / yopish
        profile.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (!dropdown.classList.contains("open")) return;
            if (dropdown.contains(e.target) || profile.contains(e.target)) return;
            dropdown.classList.remove("open");
        });

        // Til almashtirgichni yaratish
        if (window.FuzzLang) {
            FuzzLang.buildLangSwitcher(document.getElementById("lang-switcher"));
        }

        // Logout
        document.getElementById("logout-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.FuzzAuth) FuzzAuth.logout();
        });
    }


    /* ==========================================================
       4. NAVBAR TUGMALARI
       ========================================================== */
    function initCartButton() {
        document.getElementById("btn-cart")?.addEventListener("click", () => {
            window.location.href = "cart.html";
        });
    }

    function initSearchButton() {
        document.getElementById("btn-search")?.addEventListener("click", () => {
            const input = document.getElementById("store-search-input");
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                window.location.href = "store.html";
            }
        });
    }

    function initNotifButton() {
        document.getElementById("btn-notif")?.addEventListener("click", () => {
            if (window.FuzzToast) FuzzToast.info("No new notifications", 2000);
        });
    }

    function initDownloadButton() {
        const btn = document.querySelector(".btn-download-fuzz");
        if (!btn) return;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.FuzzPWA && window.FuzzPWA.canInstall) {
                window.FuzzPWA.install();
            } else if (window.FuzzToast) {
                FuzzToast.info("Install not available. Use your browser menu.");
            }
        });
    }


    /* ==========================================================
       5. MOBIL NAVBAR (pastki qismga tushishi)
       ========================================================== */
    function setupMobileNavbar() {
        const mq = window.matchMedia("(max-width: 768px)");
        const apply = () => document.body.classList.toggle("mobile-nav-bottom", mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
    }


    /* ==========================================================
       6. INIT
       ========================================================== */
    function init() {
        initSplash();
        initNavbar();
        initProfileMenu();
        initCartButton();
        initSearchButton();
        initNotifButton();
        initDownloadButton();
        setupMobileNavbar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
/* ============================================================
   FUZZ — store.js (v5 — Wallet + Steam Downloads)
   ============================================================ */

(function () {
    "use strict";

    const CFG = window.FUZZ_CONFIG || {};
    const DATA_PATHS = (CFG.DATA) || { games: "data/games.json" };
    const LS_KEYS = (CFG.LS_KEYS) || {
        cart:     "fuzz_cart",
        wishlist: "fuzz_wishlist",
        owned:    "fuzz_owned",
        wallet:   "fuzz_wallet"
    };

    const state = {
        games: [], filtered: [], cart: [], wishlist: [], owned: [],
        wallet: 0,
        filters: { search: "", genre: "all", price: "all", sort: "popular", event: "all", discount: "all", company: "all" }
    };

    const LS = {
        get(key, fallback = []) {
            try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } 
            catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
        }
    };

    async function loadGames() {
        try {
            const res = await fetch(DATA_PATHS.games);
            if (res.ok) { state.games = await res.json(); return; }
        } catch (e) {}
        state.games = [];
    }

    function finalPrice(game) {
        if (!game.discount) return game.price;
        return +(game.price * (1 - game.discount / 100)).toFixed(2);
    }

    function formatPrice(p) {
        if (p === 0) return window.FuzzLang ? FuzzLang.t("game_free") : "Free";
        return "$" + p.toFixed(2);
    }

    /* --- WALLET --- */
    function getBalance() {
        return parseFloat(localStorage.getItem(LS_KEYS.wallet)) || 0;
    }

    function setBalance(amount) {
        localStorage.setItem(LS_KEYS.wallet, amount.toFixed(2));
        updateWalletUI();
        window.dispatchEvent(new CustomEvent("fuzz:wallet-updated"));
    }

    function updateWalletUI() {
        const el = document.getElementById("wallet-balance-navbar");
        if (el) el.textContent = `Wallet($${getBalance().toFixed(2)})`;
    }

    /* --- FILTER --- */
    function applyFilters() {
        let list = [...state.games];

        if (state.filters.search) {
            const q = state.filters.search.toLowerCase().trim();
            list = list.filter(g =>
                (g.title || "").toLowerCase().includes(q) ||
                (g.genre || "").toLowerCase().includes(q) ||
                (g.company || "").toLowerCase().includes(q)
            );
        }
        if (state.filters.genre !== "all") list = list.filter(g => g.genre === state.filters.genre);
        if (state.filters.price !== "all") {
            if (state.filters.price === "free") list = list.filter(g => finalPrice(g) === 0);
            else if (state.filters.price === "under5") list = list.filter(g => finalPrice(g) < 5);
            else if (state.filters.price === "under20") list = list.filter(g => finalPrice(g) < 20);
        }
        if (state.filters.event !== "all") {
            if (state.filters.event === "sale") list = list.filter(g => (g.discount || 0) > 0);
            else if (state.filters.event === "popular") list = list.filter(g => (g.rating || 0) >= 4.5);
        }
        if (state.filters.discount !== "all") {
            if (state.filters.discount === "any") list = list.filter(g => (g.discount || 0) > 0);
            else if (state.filters.discount === "50plus") list = list.filter(g => (g.discount || 0) >= 50);
            else if (state.filters.discount === "70plus") list = list.filter(g => (g.discount || 0) >= 70);
        }
        if (state.filters.company !== "all") list = list.filter(g => (g.company || "UPDATE Inc.") === state.filters.company);

        switch (state.filters.sort) {
            case "rating": list.sort((a, b) => b.rating - a.rating); break;
            case "newest": list.sort((a, b) => (b.id > a.id ? 1 : -1)); break;
            case "price_low": list.sort((a, b) => finalPrice(a) - finalPrice(b)); break;
            case "price_high": list.sort((a, b) => finalPrice(b) - finalPrice(a)); break;
            case "discount": list.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
            default: list.sort((a, b) => b.rating - a.rating); break;
        }
        state.filtered = list;
    }

    /* --- RENDER CARD --- */
    function renderGameCard(game) {
        const card = document.createElement("div");
        card.className = "game-card card";
        
        const isOwned = state.owned.includes(game.id);
        const isInCart = state.cart.includes(game.id);
        const isWished = state.wishlist.includes(game.id);
        const discounted = game.discount > 0;
        const final = finalPrice(game);
        const company = game.company || "UPDATE Inc.";
        const isFree = final === 0;

        // Download statusini tekshirish
        const dl = window.FuzzDownloads ? window.FuzzDownloads.getDownloads()[game.id] : null;
        const isDownloading = dl && dl.status === "downloading";
        const isPaused = dl && dl.status === "paused";

        card.innerHTML = `
            ${discounted ? `<div class="game-card-discount badge badge-success">-${game.discount}%</div>` : ''}
            <img class="game-card-image" src="${game.image}" alt="${game.title}" loading="lazy">
            <div class="game-card-body">
                <h3 class="game-card-title">${game.title}</h3>
                <span class="game-card-genre text-muted">${game.genre}</span>
                <span class="game-card-company text-dim"><i class="fa-solid fa-building"></i> ${company}</span>
                <div class="game-card-footer">
                    <div>
                        ${discounted ? `<span class="game-card-price old text-dim">$${game.price.toFixed(2)}</span>` : ''}
                        <span class="game-card-price ${isFree ? 'text-success' : 'text-accent'}">${formatPrice(final)}</span>
                    </div>
                    <div class="game-card-rating text-warning"><i class="fa-solid fa-star"></i> <span>${game.rating.toFixed(1)}</span></div>
                </div>
            </div>
            <div class="game-card-actions">
                ${isOwned 
                    ? (isDownloading 
                        ? `<button class="btn-ghost" disabled style="color:var(--color-accent);"><i class="fa-solid fa-spinner fa-spin"></i> ${dl.progress}%</button>`
                        : isPaused
                            ? `<button class="btn-primary" data-action="resume"><i class="fa-solid fa-play"></i> Resume</button>`
                            : `<button class="btn-primary" data-action="install"><i class="fa-solid fa-download"></i> Install</button>`)
                    : isInCart
                        ? `<button class="btn-ghost" data-action="remove-cart"><i class="fa-solid fa-check"></i> In Cart</button>`
                        : `<button class="btn-primary" data-action="buy"><i class="${isFree ? 'fa-solid fa-play' : 'fa-solid fa-cart-plus'}"></i> ${isFree ? 'Play' : 'Buy'}</button>`}
                <button class="btn-ghost" data-action="wishlist" aria-label="Wishlist">
                    <i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
        `;

        card.querySelector('[data-action="buy"]')?.addEventListener("click", (e) => { e.stopPropagation(); window.FuzzStore.buyGame(game.id); });
        card.querySelector('[data-action="remove-cart"]')?.addEventListener("click", (e) => { e.stopPropagation(); window.FuzzStore.removeFromCart(game.id); });
        card.querySelector('[data-action="wishlist"]')?.addEventListener("click", (e) => { e.stopPropagation(); window.FuzzStore.toggleWishlist(game.id); });
        
        // Install / Resume
        card.querySelector('[data-action="install"]')?.addEventListener("click", (e) => { 
            e.stopPropagation(); 
            window.FuzzDownloads.startDownload(game.id);
            window.FuzzToast.info("Download started in background!");
            window.location.href = "downloads.html"; // Steam kabi download sahifasiga o'tadi
        });
        card.querySelector('[data-action="resume"]')?.addEventListener("click", (e) => { 
            e.stopPropagation(); 
            window.FuzzDownloads.togglePause(game.id);
        });

        card.addEventListener("click", () => window.location.href = `game.html?id=${game.id}`);
        return card;
    }

    function renderGrid() {
        const grid = document.getElementById("game-grid");
        if (!grid) return;
        grid.innerHTML = "";
        if (state.filtered.length === 0) {
            grid.innerHTML = `<p class="text-muted" style="padding:40px;text-align:center;grid-column:1/-1;">No games found.</p>`;
            return;
        }
        const frag = document.createDocumentFragment();
        state.filtered.forEach(g => frag.appendChild(renderGameCard(g)));
        grid.appendChild(frag);
        if (window.FuzzLang) FuzzLang.applyTranslations(grid);
    }

    function renderDeals() {
        const row = document.getElementById("deals-row");
        if (!row) return;
        row.innerHTML = "";
        const deals = state.games.filter(g => g.discount > 0);
        if (deals.length === 0) { row.innerHTML = '<p class="text-muted">No active deals.</p>'; return; }
        const frag = document.createDocumentFragment();
        deals.forEach(g => frag.appendChild(renderGameCard(g)));
        row.appendChild(frag);
    }

    function addToCart(id) {
        if (state.cart.includes(id)) return;
        state.cart.push(id);
        LS.set(LS_KEYS.cart, state.cart);
        updateCartBadge(); refreshGrid();
        if (window.FuzzToast) FuzzToast.success("toast_added_cart");
    }

    function removeFromCart(id) {
        state.cart = state.cart.filter(x => x !== id);
        LS.set(LS_KEYS.cart, state.cart);
        updateCartBadge(); refreshGrid();
        if (window.FuzzToast) FuzzToast.info("toast_removed_cart");
    }

    function updateCartBadge() {
        const badges = document.querySelectorAll("#cart-badge");
        badges.forEach(b => {
            b.textContent = state.cart.length;
            b.style.display = state.cart.length > 0 ? "flex" : "none";
        });
    }

    function toggleWishlist(id) {
        const idx = state.wishlist.indexOf(id);
        if (idx >= 0) { state.wishlist.splice(idx, 1); if (window.FuzzToast) FuzzToast.info("toast_removed_wish"); }
        else { state.wishlist.push(id); if (window.FuzzToast) FuzzToast.success("toast_added_wish"); }
        LS.set(LS_KEYS.wishlist, state.wishlist);
        refreshGrid();
    }

    function bindFilters() {
        document.querySelector(".filter-search")?.addEventListener("input", (e) => { state.filters.search = e.target.value.trim(); applyFilters(); renderGrid(); });
        document.querySelector(".filter-genre")?.addEventListener("change", (e) => { state.filters.genre = e.target.value; applyFilters(); renderGrid(); });
        document.querySelector(".filter-price")?.addEventListener("change", (e) => { state.filters.price = e.target.value; applyFilters(); renderGrid(); });
        document.querySelector(".filter-event")?.addEventListener("change", (e) => { state.filters.event = e.target.value; applyFilters(); renderGrid(); });
        document.querySelector(".filter-discount")?.addEventListener("change", (e) => { state.filters.discount = e.target.value; applyFilters(); renderGrid(); });
        document.querySelector(".filter-company")?.addEventListener("change", (e) => { state.filters.company = e.target.value; applyFilters(); renderGrid(); });
        document.querySelector(".filter-sort")?.addEventListener("change", (e) => { state.filters.sort = e.target.value; applyFilters(); renderGrid(); });

        const topSearch = document.getElementById("store-search-input");
        const topClear = document.getElementById("store-search-clear");
        topSearch?.addEventListener("input", (e) => { state.filters.search = e.target.value.trim(); applyFilters(); renderGrid(); const old = document.querySelector(".filter-search"); if(old) old.value = e.target.value; });
        topClear?.addEventListener("click", () => { if(topSearch) topSearch.value=""; const old = document.querySelector(".filter-search"); if(old) old.value=""; state.filters.search=""; applyFilters(); renderGrid(); });
    }

    function refreshGrid() { applyFilters(); renderGrid(); renderDeals(); }

    window.FuzzStore = {
        get games() { return state.games; },
        get filtered() { return state.filtered; },
        get cart() { return state.cart; },
        get wishlist() { return state.wishlist; },
        get owned() { return state.owned; },
        getBalance, setBalance,
        load: loadGames, refresh: refreshGrid, finalPrice, formatPrice,
        addToCart, removeFromCart, toggleWishlist,
        getGame: (id) => state.games.find(g => g.id === id),
        
        // Yangi: Pul to'lash yoki Free olish
        buyGame(id) {
            const game = state.games.find(g => g.id === id);
            if (!game) return false;
            const price = finalPrice(game);

            if (price === 0) {
                if (!state.owned.includes(id)) {
                    state.owned.push(id);
                    LS.set(LS_KEYS.owned, state.owned);
                    window.dispatchEvent(new CustomEvent("fuzz:library-updated"));
                    if (window.FuzzToast) FuzzToast.success("Added to Library for free!");
                    refreshGrid();
                }
                return true;
            } else {
                // Wallet orqali sotib olish
                const balance = getBalance();
                if (balance >= price) {
                    setBalance(balance - price);
                    state.owned.push(id);
                    LS.set(LS_KEYS.owned, state.owned);
                    if (window.FuzzToast) FuzzToast.success(`Purchased for $${price.toFixed(2)}!`);
                    refreshGrid();
                } else {
                    addToCart(id);
                    if (window.FuzzToast) FuzzToast.warning("Not enough balance. Added to cart.");
                }
                return false;
            }
        }
    };

    async function init() {
        state.cart = LS.get(LS_KEYS.cart, []);
        state.wishlist = LS.get(LS_KEYS.wishlist, []);
        state.owned = LS.get(LS_KEYS.owned, []);
        updateCartBadge();
        updateWalletUI();
        await loadGames();
        bindFilters();
        refreshGrid();
        window.addEventListener("fuzz:downloads-updated", refreshGrid);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

})();
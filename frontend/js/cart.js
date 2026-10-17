/* ============================================================
   FUZZ — cart.js (v3 — To'liq tuzatilgan)
   Savat sahifasi logikasi. O'yinlarni to'g'ri render qiladi.
   ============================================================ */

(function () {
    "use strict";

    const CFG = window.FUZZ_CONFIG || {};
    const LS_KEYS = CFG.LS_KEYS || { cart: "fuzz_cart", owned: "fuzz_owned" };

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEYS.cart) || "[]");
        } catch { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(LS_KEYS.cart, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("fuzz:cart-updated"));
    }

    function renderCart() {
        const container = document.getElementById("cart-items");
        const totalEl   = document.getElementById("cart-total");
        const subEl     = document.getElementById("cart-subtotal");
        
        if (!container) return;

        const cartIds = getCart();

        if (cartIds.length === 0) {
            container.innerHTML = `
                <div class="cart-empty card">
                    <i class="fa-solid fa-cart-shopping text-dim" style="font-size:48px;margin-bottom:16px;"></i>
                    <p class="text-muted">${window.FuzzLang ? FuzzLang.t("cart_empty") : "Your cart is empty"}</p>
                </div>`;
            if (totalEl) totalEl.textContent = "$0.00";
            if (subEl)   subEl.textContent = "$0.00";
            return;
        }

        let total = 0;
        container.innerHTML = "";

        cartIds.forEach(id => {
            // O'yinni FuzzStore dan qidiramiz
            const game = window.FuzzStore?.getGame(id);
            if (!game) return; // Agar o'yin topilmasa (o'chirilgan bo'lsa), o'tkazib yuboramiz

            const price = window.FuzzStore?.finalPrice(game) ?? game.price;
            total += price;

            const item = document.createElement("div");
            item.className = "cart-item card";
            item.innerHTML = `
                <img src="${game.image}" alt="${game.title}" class="cart-item-image" loading="lazy">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${game.title}</h3>
                    <p class="cart-item-meta text-muted">${game.genre || "Game"}</p>
                </div>
                <div class="cart-item-price">${window.FuzzStore?.formatPrice(price) || "$" + price}</div>
                <button class="cart-item-remove btn-ghost" data-id="${id}" aria-label="Remove">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            container.appendChild(item);
        });

        // O'chirish tugmalari
        container.querySelectorAll(".cart-item-remove").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const newCart = getCart().filter(x => x !== id);
                saveCart(newCart);
                renderCart(); // Qayta chizish
                if (window.FuzzToast) FuzzToast.info("toast_removed_cart");
                
                // Navbar'dagi badge'ni yangilash
                if (window.FuzzStore && window.FuzzStore.removeFromCart) {
                    window.FuzzStore.removeFromCart(id);
                }
            });
        });

        if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
        if (subEl)   subEl.textContent = "$" + total.toFixed(2);
    }

    function init() {
        // Store yuklangach chizamiz (o'yin ma'lumotlari kerak chunki)
        const tryRender = () => {
            if (window.FuzzStore && window.FuzzStore.games.length > 0) {
                renderCart();
            } else {
                setTimeout(tryRender, 100); // Store yuklanmaguncha kutamiz
            }
        };
        tryRender();

        // Boshqa sahifadan qo'shilganda yangilash
        window.addEventListener("fuzz:cart-updated", renderCart);

        // Checkout tugmasi
        document.getElementById("cart-checkout-btn")?.addEventListener("click", () => {
            if (getCart().length === 0) {
                if (window.FuzzToast) FuzzToast.warning("Cart is empty");
                return;
            }
            if (window.FuzzToast) FuzzToast.info("Payment system coming soon!");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
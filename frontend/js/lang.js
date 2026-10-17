/* ============================================================
   FUZZ — lang.js
   3 tilli tarjima tizimi: English (default) / Русский / O'zbek
   Format: "key" : { en, ru, uz }
   ============================================================ */

(function () {
    "use strict";

    /* ==========================================================
       1. TARJIMALAR LUG'ATI
       ========================================================== */
    const translations = {

        /* ---------- Umumiy ---------- */
        "app_name":            { en: "Fuzz",                       ru: "Fuzz",                       uz: "Fuzz" },
        "loading":             { en: "Loading…",                   ru: "Загрузка…",                  uz: "Yuklanmoqda…" },
        "close":               { en: "Close",                      ru: "Закрыть",                    uz: "Yopish" },
        "cancel":              { en: "Cancel",                     ru: "Отмена",                     uz: "Bekor qilish" },
        "confirm":             { en: "Confirm",                    ru: "Подтвердить",                uz: "Tasdiqlash" },
        "save":                { en: "Save",                       ru: "Сохранить",                  uz: "Saqlash" },
        "delete":              { en: "Delete",                     ru: "Удалить",                    uz: "O'chirish" },
        "edit":                { en: "Edit",                       ru: "Редактировать",              uz: "Tahrirlash" },
        "back":                { en: "Back",                       ru: "Назад",                      uz: "Orqaga" },
        "yes":                 { en: "Yes",                        ru: "Да",                         uz: "Ha" },
        "no":                  { en: "No",                         ru: "Нет",                        uz: "Yo'q" },
        "ok":                  { en: "OK",                         ru: "ОК",                         uz: "OK" },

        /* ---------- Splash ---------- */
        "splash_waiting":      { en: "Waiting for network…",       ru: "Ожидание сети…",             uz: "Tarmoq kutilmoqda…" },
        "splash_guest":        { en: "Guest",                      ru: "Гость",                      uz: "Mehmon" },

        /* ---------- URL Bar ---------- */
        "urlbar_refresh":      { en: "Refresh page",               ru: "Обновить страницу",          uz: "Sahifani yangilash" },
        "urlbar_copy":         { en: "Copy URL",                   ru: "Копировать ссылку",          uz: "Havolani nusxalash" },
        "urlbar_copied":       { en: "URL copied!",                ru: "Ссылка скопирована!",        uz: "Havola nusxalandi!" },
        "urlbar_secure":       { en: "Secure connection",          ru: "Безопасное соединение",      uz: "Xavfsiz ulanish" },

        /* ---------- Navbar ---------- */
        "nav_store":           { en: "Store",                      ru: "Магазин",                    uz: "Do'kon" },
        "nav_library":         { en: "Library",                    ru: "Библиотека",                 uz: "Kutubxona" },
        "nav_wishlist":        { en: "Wishlist",                   ru: "Список желаний",             uz: "Istaklarim" },
        "nav_workshop":        { en: "Workshop",                   ru: "Мастерская",                 uz: "Ustaxona" },
        "nav_profile":         { en: "Profile",                    ru: "Профиль",                    uz: "Profil" },
        "nav_settings":        { en: "Settings",                   ru: "Настройки",                  uz: "Sozlamalar" },
        "nav_logout":          { en: "Log out",                    ru: "Выйти",                      uz: "Chiqish" },
        "nav_login":           { en: "Log in",                     ru: "Войти",                      uz: "Kirish" },
        "nav_search":          { en: "Search",                     ru: "Поиск",                      uz: "Qidirish" },
        "nav_cart":            { en: "Cart",                       ru: "Корзина",                    uz: "Savat" },
        "nav_notifications":   { en: "Notifications",              ru: "Уведомления",                uz: "Bildirishnomalar" },
        "nav_menu":            { en: "Menu",                       ru: "Меню",                       uz: "Menyu" },

        /* ---------- Hero ---------- */
        "hero_title":          { en: "Welcome to Fuzz",            ru: "Добро пожаловать в Fuzz",    uz: "Fuzz'ga xush kelibsiz" },
        "hero_sub":            { en: "Play, buy, and mod HTML games — all in one place.",
                                 ru: "Играйте, покупайте и модифицируйте HTML-игры — всё в одном месте.",
                                 uz: "HTML o'yinlarni o'ynang, sotib oling va modifikatsiya qiling — barchasi bir joyda." },
        "hero_cta":            { en: "Browse Store",               ru: "Открыть магазин",            uz: "Do'konni ko'rish" },

        /* ---------- Filters ---------- */
        "filter_title":        { en: "Filters",                    ru: "Фильтры",                    uz: "Filtrlar" },
        "filter_search":       { en: "Search games…",              ru: "Поиск игр…",                 uz: "O'yinlarni qidirish…" },
        "filter_all":          { en: "All genres",                 ru: "Все жанры",                  uz: "Barcha janrlar" },
        "filter_price_all":    { en: "All prices",                 ru: "Все цены",                   uz: "Barcha narxlar" },
        "filter_free":         { en: "Free",                       ru: "Бесплатно",                  uz: "Bepul" },
        "filter_under_5":      { en: "Under $5",                   ru: "До $5",                      uz: "$5 gacha" },
        "filter_under_20":     { en: "Under $20",                  ru: "До $20",                     uz: "$20 gacha" },
        "filter_sort":         { en: "Sort by",                    ru: "Сортировать по",             uz: "Saralash" },
        "filter_rating":       { en: "Rating",                     ru: "Рейтинг",                    uz: "Reyting" },
        "filter_newest":       { en: "Newest",                     ru: "Новые",                      uz: "Eng yangi" },
        "filter_popular":      { en: "Popular",                    ru: "Популярные",                 uz: "Mashhur" },

        /* ---------- Game card ---------- */
        "game_buy":            { en: "Buy",                        ru: "Купить",                     uz: "Sotib olish" },
        "game_add_cart":       { en: "Add to Cart",                ru: "В корзину",                  uz: "Savatga" },
        "game_in_cart":        { en: "In Cart",                    ru: "В корзине",                  uz: "Savatda" },
        "game_owned":          { en: "Owned",                      ru: "Куплено",                    uz: "Sotib olingan" },
        "game_play":           { en: "Play",                       ru: "Играть",                     uz: "O'ynash" },
        "game_free":           { en: "Free",                       ru: "Бесплатно",                  uz: "Bepul" },
        "game_wishlist_add":   { en: "Add to Wishlist",            ru: "В список желаний",           uz: "Istaklarga qo'shish" },
        "game_wishlist_remove":{ en: "Remove from Wishlist",       ru: "Убрать из желаний",          uz: "Istaklardan olib tashlash" },
        "game_reviews":        { en: "Reviews",                    ru: "Отзывы",                     uz: "Sharhlar" },
        "game_news":           { en: "News",                       ru: "Новости",                    uz: "Yangiliklar" },
        "game_details":        { en: "Details",                    ru: "Подробности",                uz: "Tafsilotlar" },

        /* ---------- Deals ---------- */
        "deals_title":         { en: "🔥 Deals",                   ru: "🔥 Скидки",                  uz: "🔥 Chegirmalar" },
        "deals_sub":           { en: "Limited-time offers",        ru: "Ограниченные предложения",   uz: "Vaqtinchalik takliflar" },

        /* ---------- Cart ---------- */
        "cart_title":          { en: "Your Cart",                  ru: "Ваша корзина",               uz: "Savat" },
        "cart_summary":        { en: "Order Summary",              ru: "Сводка заказа",              uz: "Buyurtma xulosasi" },
        "cart_subtotal":       { en: "Subtotal",                   ru: "Промежуточный итог",         uz: "Oraliq jami" },
        "cart_tax":            { en: "Estimated Tax",              ru: "Ориентировочный налог",      uz: "Taxminiy soliq" },
        "cart_continue":       { en: "Continue Shopping",          ru: "Продолжить покупки",         uz: "Xaridni davom ettirish" },
        "cart_empty":          { en: "Your cart is empty",         ru: "Корзина пуста",              uz: "Savat bo'sh" },
        "cart_total":          { en: "Total",                      ru: "Итого",                      uz: "Jami" },
        "cart_checkout":       { en: "Checkout",                   ru: "Оформить заказ",             uz: "To'lash" },
        "cart_remove":         { en: "Remove",                     ru: "Удалить",                    uz: "O'chirish" },

        /* ---------- Payment ---------- */
        "pay_title":           { en: "Payment",                    ru: "Оплата",                     uz: "To'lov" },
        "pay_card":            { en: "Card number",                ru: "Номер карты",                uz: "Karta raqami" },
        "pay_owner":           { en: "Card owner",                 ru: "Владелец карты",             uz: "Karta egasi" },
        "pay_send_receipt":    { en: "Send the receipt to admin's Telegram after payment.",
                                 ru: "После оплаты отправьте чек в Telegram администратора.",
                                 uz: "To'lovdan keyin chekni adminning Telegram'iga yuboring." },
        "pay_guarantee":       { en: "If the game does not appear in your profile within 24 hours, we will give you the game for free and refund 100% of your money.",
                                 ru: "Если игра не появится в вашем профиле в течение 24 часов, мы дадим вам игру бесплатно и вернём 100% денег.",
                                 uz: "Agar o'yin 24 soat ichida profilingizda paydo bo'lmasa, biz o'yinni bepul beramiz va pulingizni 100% qaytaramiz." },

        /* ---------- Auth ---------- */
        "auth_login":          { en: "Log in",                     ru: "Войти",                      uz: "Kirish" },
        "auth_signup":         { en: "Sign up",                    ru: "Регистрация",                uz: "Ro'yxatdan o'tish" },
        "auth_email":          { en: "Email",                      ru: "Электронная почта",          uz: "Elektron pochta" },
        "auth_password":       { en: "Password",                   ru: "Пароль",                     uz: "Parol" },
        "auth_username":       { en: "Username",                   ru: "Имя пользователя",           uz: "Foydalanuvchi nomi" },
        "auth_google":         { en: "Sign in with Google",        ru: "Войти через Google",         uz: "Google bilan kirish" },
        "auth_or":             { en: "or",                         ru: "или",                        uz: "yoki" },
        "auth_qr_title":       { en: "Scan QR to log in",          ru: "Отсканируйте QR для входа",  uz: "Kirish uchun QR skanerlang" },
        "auth_qr_hint":        { en: "Open the app on your phone and scan this code.",
                                 ru: "Откройте приложение на телефоне и отсканируйте код.",
                                 uz: "Telefonda ilovani oching va kodni skanerlang." },
        "auth_qr_scan":        { en: "Scan QR",                    ru: "Сканировать QR",             uz: "QR skanerlash" },
        "auth_qr_only_mobile": { en: "QR scanning is only available on mobile devices.",
                                 ru: "Сканирование QR доступно только на мобильных устройствах.",
                                 uz: "QR skanerlash faqat mobil qurilmalarda mavjud." },
        "auth_qr_only_desktop":{ en: "QR display is only available on desktop.",
                                 ru: "Отображение QR доступно только на компьютере.",
                                 uz: "QR ko'rsatish faqat kompyuterda mavjud." },
        "auth_logout_confirm": { en: "Are you sure you want to log out?",
                                 ru: "Вы уверены, что хотите выйти?",
                                 uz: "Chiqishni xohlaysizmi?" },

        /* ---------- Profile ---------- */
        "profile_title":       { en: "Profile",                    ru: "Профиль",                    uz: "Profil" },
        "profile_owned":       { en: "Owned games",                ru: "Купленные игры",             uz: "Sotib olingan o'yinlar" },
        "profile_wishlist":    { en: "Wishlist",                   ru: "Список желаний",             uz: "Istaklar ro'yxati" },
        "profile_language":    { en: "Language",                   ru: "Язык",                       uz: "Til" },
        "profile_save":        { en: "Save changes",               ru: "Сохранить изменения",        uz: "O'zgarishlarni saqlash" },

        /* ---------- Toast / Notifications ---------- */
        "toast_added_cart":    { en: "Added to cart",              ru: "Добавлено в корзину",        uz: "Savatga qo'shildi" },
        "toast_removed_cart":  { en: "Removed from cart",          ru: "Удалено из корзины",         uz: "Savatdan olib tashlandi" },
        "toast_added_wish":    { en: "Added to wishlist",          ru: "Добавлено в желания",        uz: "Istaklarga qo'shildi" },
        "toast_removed_wish":  { en: "Removed from wishlist",      ru: "Удалено из желаний",         uz: "Istaklardan olib tashlandi" },
        "toast_login_success": { en: "Logged in successfully",     ru: "Вы успешно вошли",           uz: "Muvaffaqiyatli kirdingiz" },
        "toast_logout":        { en: "Logged out",                 ru: "Вы вышли",                   uz: "Chiqdingiz" },
        "toast_error":         { en: "Something went wrong",       ru: "Что-то пошло не так",        uz: "Xatolik yuz berdi" },
        "toast_offline":       { en: "You are offline",            ru: "Вы офлайн",                  uz: "Siz oflaynsiz" },
        "toast_online":        { en: "Back online",                ru: "Снова онлайн",               uz: "Yana onlayn" },
        "toast_rate_limit":    { en: "Too many attempts. Please wait.",
                                 ru: "Слишком много попыток. Подождите.",
                                 uz: "Juda ko'p urinish. Iltimos kuting." },

        /* ---------- Footer ---------- */
        "footer_platform":     { en: "Platform",                   ru: "Платформа",                  uz: "Platforma" },
        "footer_support":      { en: "Support",                    ru: "Поддержка",                  uz: "Yordam" },
        "footer_legal":        { en: "Legal",                      ru: "Правовая информация",        uz: "Huquqiy" },
        "footer_follow":       { en: "Follow",                     ru: "Подписаться",                uz: "Kuzatish" },
        "footer_help":         { en: "Help",                       ru: "Помощь",                     uz: "Yordam" },
        "footer_contact":      { en: "Contact",                    ru: "Контакты",                   uz: "Aloqa" },
        "footer_refund":       { en: "Refund Policy",              ru: "Политика возврата",          uz: "Qaytarish siyosati" },
        "footer_privacy":      { en: "Privacy",                    ru: "Конфиденциальность",         uz: "Maxfiylik" },
        "footer_terms":        { en: "Terms",                      ru: "Условия",                    uz: "Shartlar" },
        "footer_rights":       { en: "All rights reserved.",       ru: "Все права защищены.",        uz: "Barcha huquqlar himoyalangan." },
        "footer_note":         { en: "Offline mode • Backups • Accessibility supported",
                                 ru: "Офлайн-режим • Резервные копии • Доступность",
                                 uz: "Oflayn rejim • Zaxira nusxalar • Qulaylik" },

        /* ---------- 404 ---------- */
        "err404_title":        { en: "Page Not Found",             ru: "Страница не найдена",        uz: "Sahifa topilmadi" },
        "err404_text":         { en: "The page you are looking for doesn't exist.",
                                 ru: "Страница, которую вы ищете, не существует.",
                                 uz: "Siz izlagan sahifa mavjud emas." },
        "err404_home":         { en: "Return Home",                ru: "На главную",                 uz: "Bosh sahifaga" },

        /* ---------- Admin ---------- */
        "admin_dashboard":     { en: "Dashboard",                  ru: "Панель управления",          uz: "Boshqaruv paneli" },
        "admin_add_game":      { en: "Add Game",                   ru: "Добавить игру",              uz: "O'yin qo'shish" },
        "admin_roles":         { en: "ROLE Panel",                 ru: "Панель ролей",               uz: "Rol paneli" },
        "admin_users":         { en: "Users",                      ru: "Пользователи",               uz: "Foydalanuvchilar" },
        "admin_deals":         { en: "Deals & Discounts",          ru: "Скидки",                     uz: "Chegirmalar" },
        "admin_stats":         { en: "Statistics",                 ru: "Статистика",                 uz: "Statistika" },

        /* ---------- Government ---------- */
        "gov_title":           { en: "Government Panel",           ru: "Государственная панель",     uz: "Hukumat paneli" },
        "gov_reviews":         { en: "User Reviews",               ru: "Отзывы пользователей",       uz: "Foydalanuvchi sharhlari" },

        /* ---------- Language switcher ---------- */
        "lang_en":             { en: "English",                    ru: "English",                    uz: "English" },
        "lang_ru":             { en: "Русский",                    ru: "Русский",                    uz: "Русский" },
        "lang_uz":             { en: "O'zbek",                     ru: "O'zbek",                     uz: "O'zbek" },

        /* ---------- Sale & Discount Notifications ---------- */
        "notif_sale_title":    { en: "🔥 Big Sale!",
                                 ru: "🔥 Большая распродажа!",
                                 uz: "🔥 Katta chegirma!" },
        "notif_sale_body":     { en: "Up to 70% off on selected games. Ends in 24 hours!",
                                 ru: "Скидки до 70% на избранные игры. Заканчивается через 24 часа!",
                                 uz: "Tanlangan o'yinlarga 70% gacha chegirma. 24 soatdan keyin tugaydi!" },
        "notif_sale_expiring": { en: "⏰ Sale ending soon! Last chance to grab your favorites.",
                                 ru: "⏰ Распродажа скоро закончится! Последний шанс.",
                                 uz: "⏰ Chegirma tugayapti! Oxirgi imkoniyat." },
        "notif_new_deal":      { en: "🎉 New deal started!",
                                 ru: "🎉 Началась новая акция!",
                                 uz: "🎉 Yangi aksiya boshlandi!" },
        "notif_view_deals":    { en: "View Deals",
                                 ru: "Посмотреть скидки",
                                 uz: "Chegirmalarni ko'rish" },
        "notif_dismiss":       { en: "Dismiss",
                                 ru: "Закрыть",
                                 uz: "Yopish" },

        /* ---------- Search (Store page) ---------- */
        "search_placeholder":  { en: "Search by name, genre or company…",
                                 ru: "Поиск по названию, жанру или компании…",
                                 uz: "Nom, janr yoki kompaniya bo'yicha qidirish…" },
        "search_clear":        { en: "Clear search",
                                 ru: "Очистить поиск",
                                 uz: "Qidiruvni tozalash" },
        "search_no_results":   { en: "No games found.",
                                 ru: "Игры не найдены.",
                                 uz: "O'yinlar topilmadi." },
        "search_results":      { en: "Results",
                                 ru: "Результаты",
                                 uz: "Natijalar" },

        /* ---------- Filters (extended) ---------- */
        "filter_event":        { en: "Event",
                                 ru: "Событие",
                                 uz: "Tadbir" },
        "filter_discount":     { en: "Discount",
                                 ru: "Скидка",
                                 uz: "Chegirma" },
        "filter_price_asc":    { en: "Price: Low to High",
                                 ru: "Цена: по возрастанию",
                                 uz: "Narx: arzondan qimmatga" },
        "filter_price_desc":   { en: "Price: High to Low",
                                 ru: "Цена: по убыванию",
                                 uz: "Narx: qimmatdan arzonga" },
        "filter_price_low":    { en: "Price: Low to High",
                                 ru: "Цена: по возрастанию",
                                 uz: "Narx: arzondan qimmatga" },
        "filter_price_high":   { en: "Price: High to Low",
                                 ru: "Цена: по убыванию",
                                 uz: "Narx: qimmatdan arzonga" },
        "filter_company":      { en: "Company",
                                 ru: "Компания",
                                 uz: "Kompaniya" },
        "filter_device":       { en: "Device",
                                 ru: "Устройство",
                                 uz: "Qurilma" },
        "filter_device_all":   { en: "All devices",
                                 ru: "Все устройства",
                                 uz: "Barcha qurilmalar" },
        "filter_device_desktop": { en: "Desktop only",
                                 ru: "Только ПК",
                                 uz: "Faqat kompyuter" },
        "filter_device_mobile": { en: "Mobile only",
                                 ru: "Только мобильные",
                                 uz: "Faqat mobil" },
        "filter_device_both":  { en: "Desktop & Mobile",
                                 ru: "ПК и мобильные",
                                 uz: "Kompyuter va mobil" },

        /* ---------- Company (game cards) ---------- */
        "company_default":     { en: "UPDATE Inc.",
                                 ru: "UPDATE Inc.",
                                 uz: "UPDATE Inc." },
        "company_by":          { en: "by",
                                 ru: "от",
                                 uz: "tomonidan" },

        /* ---------- Device availability ---------- */
        "device_desktop":      { en: "Desktop",
                                 ru: "ПК",
                                 uz: "Kompyuter" },
        "device_mobile":       { en: "Mobile",
                                 ru: "Мобильные",
                                 uz: "Mobil" },
        "device_all":          { en: "All devices",
                                 ru: "Все устройства",
                                 uz: "Barcha qurilmalar" },

        /* ---------- Wallet ---------- */
        "wallet_title":        { en: "Wallet",
                                 ru: "Кошелёк",
                                 uz: "Hamyon" },
        "wallet_balance":      { en: "Balance",
                                 ru: "Баланс",
                                 uz: "Balans" },
        "wallet_add_funds":    { en: "Add Funds",
                                 ru: "Пополнить",
                                 uz: "To'ldirish" },
        "wallet_withdraw":     { en: "Withdraw",
                                 ru: "Вывести",
                                 uz: "Yechib olish" },
        "wallet_history":      { en: "Transaction History",
                                 ru: "История транзакций",
                                 uz: "Tranzaksiyalar tarixi" },
        "wallet_empty":        { en: "No transactions yet.",
                                 ru: "Пока нет транзакций.",
                                 uz: "Hozircha tranzaksiyalar yo'q." },
        "wallet_topup":        { en: "Top Up",
                                 ru: "Пополнить",
                                 uz: "To'ldirish" },

        /* ---------- Download Manager ---------- */
        "downloads_title":     { en: "Downloads",
                                 ru: "Загрузки",
                                 uz: "Yuklamalar" },
        "downloads_active":    { en: "Active",
                                 ru: "Активные",
                                 uz: "Faol" },
        "downloads_queue":     { en: "Queue",
                                 ru: "Очередь",
                                 uz: "Navbat" },
        "downloads_completed": { en: "Completed",
                                 ru: "Завершённые",
                                 uz: "Tugallangan" },
        "downloads_paused":    { en: "Paused",
                                 ru: "Приостановлено",
                                 uz: "To'xtatilgan" },
        "downloads_empty":     { en: "No downloads.",
                                 ru: "Нет загрузок.",
                                 uz: "Yuklamalar yo'q." },
        "downloads_pause":     { en: "Pause",
                                 ru: "Пауза",
                                 uz: "To'xtatish" },
        "downloads_resume":    { en: "Resume",
                                 ru: "Продолжить",
                                 uz: "Davom etish" },
        "downloads_cancel":    { en: "Cancel",
                                 ru: "Отменить",
                                 uz: "Bekor qilish" },
        "downloads_install":   { en: "Install",
                                 ru: "Установить",
                                 uz: "O'rnatish" },
        "downloads_mods":      { en: "Mods",
                                 ru: "Моды",
                                 uz: "Modlar" },
        "downloads_speed":     { en: "Speed",
                                 ru: "Скорость",
                                 uz: "Tezlik" },
        "downloads_size":      { en: "Size",
                                 ru: "Размер",
                                 uz: "Hajm" },

        /* ---------- Mods & Subscription ---------- */
        "mods_title":          { en: "Mods",
                                 ru: "Моды",
                                 uz: "Modlar" },
        "mods_subscribe":      { en: "Subscribe",
                                 ru: "Подписаться",
                                 uz: "Obuna bo'lish" },
        "mods_unsubscribe":    { en: "Unsubscribe",
                                 ru: "Отписаться",
                                 uz: "Obunani bekor qilish" },
        "mods_subscribed":     { en: "Subscribed",
                                 ru: "Подписан",
                                 uz: "Obuna bo'lingan" },
        "mods_auto_install":   { en: "Subscribed mods are installed automatically with the game.",
                                 ru: "Подписанные моды устанавливаются автоматически вместе с игрой.",
                                 uz: "Obuna bo'lgan modlar o'yin bilan birga avtomatik o'rnatiladi." },
        "mods_queued":         { en: "Mods added to download queue.",
                                 ru: "Моды добавлены в очередь загрузки.",
                                 uz: "Modlar yuklash navbatiga qo'shildi." },
        "mods_empty":          { en: "No mods available for this game.",
                                 ru: "Для этой игры нет модов.",
                                 uz: "Bu o'yin uchun modlar yo'q." },

        /* ---------- Settings ---------- */
        "settings_title":      { en: "Settings",
                                 ru: "Настройки",
                                 uz: "Sozlamalar" },
        "settings_general":    { en: "General",
                                 ru: "Общие",
                                 uz: "Umumiy" },
        "settings_account":    { en: "Account",
                                 ru: "Аккаунт",
                                 uz: "Hisob" },
        "settings_privacy":    { en: "Privacy",
                                 ru: "Конфиденциальность",
                                 uz: "Maxfiylik" },
        "settings_notifications": { en: "Notifications",
                                 ru: "Уведомления",
                                 uz: "Bildirishnomalar" },
        "settings_sound":      { en: "Sound effects",
                                 ru: "Звуковые эффекты",
                                 uz: "Ovoz effektlari" },
        "settings_reset":      { en: "Reset All Data",
                                 ru: "Сбросить все данные",
                                 uz: "Barcha ma'lumotlarni o'chirish" },
        "settings_reset_warn": { en: "This action cannot be undone. All your data will be permanently deleted.",
                                 ru: "Это действие нельзя отменить. Все ваши данные будут удалены навсегда.",
                                 uz: "Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay o'chiriladi." },
        "settings_reset_confirm_label": { en: 'Type "I am sure to reset my all datas" to confirm:',
                                 ru: 'Введите "I am sure to reset my all datas" для подтверждения:',
                                 uz: 'Tasdiqlash uchun "I am sure to reset my all datas" yozing:' },
        "settings_reset_placeholder": { en: "I am sure to reset my all datas",
                                 ru: "I am sure to reset my all datas",
                                 uz: "I am sure to reset my all datas" },
        "settings_import":     { en: "Import Data",
                                 ru: "Импорт данных",
                                 uz: "Ma'lumotlarni import qilish" },
        "settings_export":     { en: "Export Data",
                                 ru: "Экспорт данных",
                                 uz: "Ma'lumotlarni eksport qilish" },
        "settings_import_ok":  { en: "Data imported successfully.",
                                 ru: "Данные успешно импортированы.",
                                 uz: "Ma'lumotlar muvaffaqiyatli import qilindi." },
        "settings_export_ok":  { en: "Data exported successfully.",
                                 ru: "Данные успешно экспортированы.",
                                 uz: "Ma'lumotlar muvaffaqiyatli eksport qilindi." },
        "settings_reset_ok":   { en: "All data has been reset.",
                                 ru: "Все данные сброшены.",
                                 uz: "Barcha ma'lumotlar o'chirildi." },

        /* ---------- Download Fuzz button ---------- */
        "btn_download_fuzz":   { en: "Download Fuzz",
                                 ru: "Скачать Fuzz",
                                 uz: "Fuzz yuklab olish" },

        /* ---------- RIGHTS modal (Legal) ---------- */
        "footer_rights_link":  { en: "RIGHTS",
                                 ru: "ПРАВА",
                                 uz: "HUQUQLAR" },
        "rights_modal_title":  { en: "Copyright & Rights",
                                 ru: "Авторские права",
                                 uz: "Mualliflik huquqlari" },
        "rights_text":         { en: "We acknowledge that some games on our platform may originate from torrent sources, and we apologize for this. However, do not worry — we are actively working to resolve copyright-related issues. If any game owner files a complaint against our platform, we will promptly remove that game. If you have purchased that game, we will refund 100% of your money. If you are a game developer and would like to cooperate, you can contact us at the email below:",
                                 ru: "Мы признаём, что некоторые игры на нашей платформе могут быть получены из торрент-источников, и приносим за это свои извинения. Однако не беспокойтесь — мы активно работаем над решением вопросов, связанных с авторскими правами. Если владелец какой-либо игры подаст жалобу на нашу платформу, мы незамедлительно удалим эту игру. Если вы приобрели эту игру, мы вернём вам 100% денег. Если вы разработчик игр и хотите сотрудничать, свяжитесь с нами по email ниже:",
                                 uz: "Biz platformamizdagi ayrim o'yinlar torrent manbalardan olingan bo'lishi mumkinligini tan olamiz va bu holat uchun uzr so'raymiz. Biroq, xavotir olmang — biz mualliflik huquqi bilan bog'liq muammolarni hal qilish ustida faol ishlayapmiz. Agar biror o'yin egasi platformamiz ustidan shikoyat qilsa, biz o'sha o'yinni zudlik bilan o'chirib tashlaymiz. Agar siz o'sha o'yinni sotib olgan bo'lsangiz, pulingizni 100% qaytarib beramiz. Agar siz o'yin yaratuvchisi bo'lsangiz va hamkorlik qilishni istasangiz, quyidagi email orqali biz bilan bog'lanishingiz mumkin:" },
        "rights_email":        { en: "Email:",
                                 ru: "Email:",
                                 uz: "Email:" },
        "rights_close":        { en: "Close",
                                 ru: "Закрыть",
                                 uz: "Yopish" },

        /* ---------- Payment history (table) ---------- */
        "payment_history":     { en: "Payment History",
                                 ru: "История платежей",
                                 uz: "To'lovlar tarixi" },
        "payment_id":          { en: "ID",
                                 ru: "ID",
                                 uz: "ID" },
        "payment_date":        { en: "Date",
                                 ru: "Дата",
                                 uz: "Sana" },
        "payment_amount":      { en: "Amount",
                                 ru: "Сумма",
                                 uz: "Miqdor" },
        "payment_status":      { en: "Status",
                                 ru: "Статус",
                                 uz: "Holat" },
        "payment_games":       { en: "Games",
                                 ru: "Игры",
                                 uz: "O'yinlar" },
        "payment_pending":     { en: "Pending",
                                 ru: "В ожидании",
                                 uz: "Kutilmoqda" },
        "payment_completed":   { en: "Completed",
                                 ru: "Завершено",
                                 uz: "Tugallangan" },
        "payment_failed":      { en: "Failed",
                                 ru: "Ошибка",
                                 uz: "Xato" },

        /* ---------- Admin (extended) ---------- */
        "admin_add_game_title": { en: "Add New Game",
                                 ru: "Добавить новую игру",
                                 uz: "Yangi o'yin qo'shish" },
        "admin_game_title":    { en: "Title",
                                 ru: "Название",
                                 uz: "Nomi" },
        "admin_game_genre":    { en: "Genre",
                                 ru: "Жанр",
                                 uz: "Janr" },
        "admin_game_price":    { en: "Price",
                                 ru: "Цена",
                                 uz: "Narx" },
        "admin_game_discount": { en: "Discount (%)",
                                 ru: "Скидка (%)",
                                 uz: "Chegirma (%)" },
        "admin_game_company":  { en: "Company",
                                 ru: "Компания",
                                 uz: "Kompaniya" },
        "admin_game_devices":  { en: "Supported Devices",
                                 ru: "Поддерживаемые устройства",
                                 uz: "Qo'llab-quvvatlanadigan qurilmalar" },
        "admin_game_image":    { en: "Image URL",
                                 ru: "URL изображения",
                                 uz: "Rasm URL manzili" },
        "admin_game_desc":     { en: "Description",
                                 ru: "Описание",
                                 uz: "Tavsif" },
        "admin_save_game":     { en: "Save Game",
                                 ru: "Сохранить игру",
                                 uz: "O'yinni saqlash" },

        "admin_role_create":   { en: "Create Role",
                                 ru: "Создать роль",
                                 uz: "Rol yaratish" },
        "admin_role_name":     { en: "Role name",
                                 ru: "Название роли",
                                 uz: "Rol nomi" },
        "admin_role_perms":    { en: "Permissions",
                                 ru: "Разрешения",
                                 uz: "Ruxsatlar" },
        "admin_role_delete":   { en: "Delete Role",
                                 ru: "Удалить роль",
                                 uz: "Rolni o'chirish" },

        "admin_user_ban":      { en: "Ban",
                                 ru: "Забанить",
                                 uz: "Bloklash" },
        "admin_user_unban":    { en: "Unban",
                                 ru: "Разбанить",
                                 uz: "Blokdan chiqarish" },
        "admin_user_role":     { en: "Change Role",
                                 ru: "Изменить роль",
                                 uz: "Rolni o'zgartirish" },
        "admin_user_delete":   { en: "Delete User",
                                 ru: "Удалить пользователя",
                                 uz: "Foydalanuvchini o'chirish" },
        "admin_user_status":   { en: "Status",
                                 ru: "Статус",
                                 uz: "Holat" },
        "admin_user_active":   { en: "Active",
                                 ru: "Активный",
                                 uz: "Faol" },
        "admin_user_banned":   { en: "Banned",
                                 ru: "Забанен",
                                 uz: "Bloklangan" },

        "admin_deal_create":   { en: "Create Deal",
                                 ru: "Создать акцию",
                                 uz: "Aksiya yaratish" },
        "admin_deal_title":    { en: "Deal Title",
                                 ru: "Название акции",
                                 uz: "Aksiya nomi" },
        "admin_deal_games":    { en: "Select Games",
                                 ru: "Выбрать игры",
                                 uz: "O'yinlarni tanlash" },
        "admin_deal_discount": { en: "Discount (%)",
                                 ru: "Скидка (%)",
                                 uz: "Chegirma (%)" },
        "admin_deal_start":    { en: "Start Date",
                                 ru: "Дата начала",
                                 uz: "Boshlanish sanasi" },
        "admin_deal_end":      { en: "End Date",
                                 ru: "Дата окончания",
                                 uz: "Tugash sanasi" },
        "admin_deal_scheduled":{ en: "Scheduled",
                                 ru: "Запланировано",
                                 uz: "Rejalashtirilgan" },

        /* ---------- Government (extended) ---------- */
        "gov_review_id":       { en: "Review ID",
                                 ru: "ID отзыва",
                                 uz: "Sharh ID" },
        "gov_review_user":     { en: "User",
                                 ru: "Пользователь",
                                 uz: "Foydalanuvchi" },
        "gov_review_game":     { en: "Game",
                                 ru: "Игра",
                                 uz: "O'yin" },
        "gov_review_rating":   { en: "Rating",
                                 ru: "Рейтинг",
                                 uz: "Reyting" },
        "gov_review_text":     { en: "Review",
                                 ru: "Отзыв",
                                 uz: "Sharh" },
        "gov_review_date":     { en: "Date",
                                 ru: "Дата",
                                 uz: "Sana" },
        "gov_review_empty":    { en: "No reviews yet.",
                                 ru: "Пока нет отзывов.",
                                 uz: "Hozircha sharhlar yo'q." },
        "gov_filter_all":      { en: "All reviews",
                                 ru: "Все отзывы",
                                 uz: "Barcha sharhlar" },
        "gov_filter_flagged":  { en: "Flagged",
                                 ru: "Помеченные",
                                 uz: "Belgilangan" }
    };


    /* ==========================================================
       2. TILNI ANIQLASH / SAQLASH
       ========================================================== */
    const STORAGE_KEY = "fuzz_lang";
    const SUPPORTED   = ["en", "ru", "uz"];
    const DEFAULT     = "en";

    function getCurrentLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED.includes(saved)) return saved;
        const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
        return SUPPORTED.includes(browserLang) ? browserLang : DEFAULT;
    }

    function setCurrentLang(code) {
        if (!SUPPORTED.includes(code)) return;
        localStorage.setItem(STORAGE_KEY, code);
        applyTranslations();
        document.documentElement.setAttribute("lang", code);
    }


    /* ==========================================================
       3. TARJIMANI QO'LLASH
       ========================================================== */
    function t(key, lang) {
        const langCode = lang || getCurrentLang();
        const entry = translations[key];
        if (!entry) {
            console.warn("[lang.js] Missing key:", key);
            return key;
        }
        return entry[langCode] || entry[DEFAULT] || key;
    }

    function applyTranslations(root) {
        const scope = root || document;
        const lang  = getCurrentLang();

        // data-i18n — textContent
        scope.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const value = t(key, lang);
            if (value) el.textContent = value;
        });

        // data-i18n-placeholder
        scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            const value = t(key, lang);
            if (value) el.setAttribute("placeholder", value);
        });

        // data-i18n-title
        scope.querySelectorAll("[data-i18n-title]").forEach(el => {
            const key = el.getAttribute("data-i18n-title");
            const value = t(key, lang);
            if (value) el.setAttribute("title", value);
        });

        // data-i18n-aria-label
        scope.querySelectorAll("[data-i18n-aria]").forEach(el => {
            const key = el.getAttribute("data-i18n-aria");
            const value = t(key, lang);
            if (value) el.setAttribute("aria-label", value);
        });

        // data-i18n-html — xavfli, faqat ichki ishonchli kontent uchun
        scope.querySelectorAll("[data-i18n-html]").forEach(el => {
            const key = el.getAttribute("data-i18n-html");
            const value = t(key, lang);
            if (value) el.innerHTML = value;
        });
    }


    /* ==========================================================
       4. TIL ALMASHTIRGICHNI YARATISH
       ========================================================== */
    function buildLangSwitcher(container) {
        if (!container) return;
        container.innerHTML = "";

        const current = getCurrentLang();
        SUPPORTED.forEach(code => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "lang-option" + (code === current ? " active" : "");
            btn.setAttribute("data-lang", code);
            btn.textContent = t("lang_" + code, code);
            btn.addEventListener("click", () => {
                setCurrentLang(code);
                container.querySelectorAll(".lang-option")
                    .forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
            container.appendChild(btn);
        });
    }


    /* ==========================================================
       5. OBSERVER — dinamik qo'shilgan elementlar uchun
       ========================================================== */
    function observeDynamicContent() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.hasAttribute && node.hasAttribute("data-i18n")) {
                            applyTranslations(node.parentNode || document);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree:   true
        });
    }


    /* ==========================================================
       6. PUBLIC API — window.FuzzLang
       ========================================================== */
    window.FuzzLang = {
        t,
        getCurrentLang,
        setCurrentLang,
        applyTranslations,
        buildLangSwitcher,
        supported: SUPPORTED,
        translations // debug uchun
    };


    /* ==========================================================
       7. AVTOMATIK ISHGA TUSHIRISH
       ========================================================== */
    function init() {
        const lang = getCurrentLang();
        document.documentElement.setAttribute("lang", lang);
        applyTranslations();
        observeDynamicContent();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
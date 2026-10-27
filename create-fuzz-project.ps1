# ============================================================
# create-fuzz-structure.ps1
# Fuzz loyihasi uchun barcha papka va fayllarni yaratadi
# Ishlatish: powershell -ExecutionPolicy Bypass -File .\create-fuzz-structure.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = "D:\webWorld\fuzz"

Write-Host "=== Fuzz loyihasi strukturasi yaratilmoqda ===" -ForegroundColor Cyan
Write-Host "Loyiha ildizi: $ProjectRoot" -ForegroundColor Yellow

# 1. Loyiha ildizini yaratish (agar mavjud bo'lmasa)
if (-not (Test-Path $ProjectRoot)) {
    New-Item -ItemType Directory -Path $ProjectRoot -Force | Out-Null
    Write-Host "[+] Yaratildi: $ProjectRoot" -ForegroundColor Green
} else {
    Write-Host "[=] Mavjud: $ProjectRoot" -ForegroundColor Gray
}

# ============================================================
# 2. Papkalar ro'yxati
# ============================================================
$Directories = @(
    # Root-level asset papkalar (majburiy)
    "$ProjectRoot\game",
    "$ProjectRoot\image",
    "$ProjectRoot\image\games",
    "$ProjectRoot\sound",

    # Asosiy manba papkasi
    "$ProjectRoot\src",
    "$ProjectRoot\src\components",

    # Layouts
    "$ProjectRoot\src\components\layouts",

    # Common
    "$ProjectRoot\src\components\common",

    # Pages
    "$ProjectRoot\src\components\pages",

    # Admin
    "$ProjectRoot\src\components\admin",

    # Services
    "$ProjectRoot\src\components\services",

    # Hooks
    "$ProjectRoot\src\components\hooks",

    # Context
    "$ProjectRoot\src\components\context",

    # Config
    "$ProjectRoot\src\components\config",

    # Styles
    "$ProjectRoot\src\components\styles",

    # Utils
    "$ProjectRoot\src\components\utils"
)

Write-Host "`n--- Papkalar yaratilmoqda ---" -ForegroundColor Cyan
foreach ($dir in $Directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "[+] Papka: $dir" -ForegroundColor Green
    } else {
        Write-Host "[=] Mavjud: $dir" -ForegroundColor Gray
    }
}

# ============================================================
# 3. Fayllar ro'yxati (bo'sh fayllar)
# ============================================================
$Files = @(
    # --- Root fayllar ---
    "$ProjectRoot\index.html",
    "$ProjectRoot\package.json",
    "$ProjectRoot\vite.config.js",
    "$ProjectRoot\vercel.json",
    "$ProjectRoot\.gitignore",
    "$ProjectRoot\README.md",
    "$ProjectRoot\create-fuzz-project.ps1",

    # --- src/components asosiy fayllar ---
    "$ProjectRoot\src\components\main.jsx",
    "$ProjectRoot\src\components\App.jsx",
    "$ProjectRoot\src\components\router.jsx",

    # --- layouts ---
    "$ProjectRoot\src\components\layouts\MainLayout.jsx",
    "$ProjectRoot\src\components\layouts\AdminLayout.jsx",
    "$ProjectRoot\src\components\layouts\AuthLayout.jsx",

    # --- common ---
    "$ProjectRoot\src\components\common\Header.jsx",
    "$ProjectRoot\src\components\common\Navigation.jsx",
    "$ProjectRoot\src\components\common\Sidebar.jsx",
    "$ProjectRoot\src\components\common\Footer.jsx",
    "$ProjectRoot\src\components\common\SearchBar.jsx",
    "$ProjectRoot\src\components\common\GameCard.jsx",
    "$ProjectRoot\src\components\common\GameGrid.jsx",
    "$ProjectRoot\src\components\common\Modal.jsx",
    "$ProjectRoot\src\components\common\Toast.jsx",
    "$ProjectRoot\src\components\common\Loading.jsx",
    "$ProjectRoot\src\components\common\EmptyState.jsx",
    "$ProjectRoot\src\components\common\ErrorState.jsx",
    "$ProjectRoot\src\components\common\ProtectedRoute.jsx",
    "$ProjectRoot\src\components\common\Pagination.jsx",

    # --- pages ---
    "$ProjectRoot\src\components\pages\HomePage.jsx",
    "$ProjectRoot\src\components\pages\StorePage.jsx",
    "$ProjectRoot\src\components\pages\CategoriesPage.jsx",
    "$ProjectRoot\src\components\pages\NewReleasesPage.jsx",
    "$ProjectRoot\src\components\pages\SpecialOffersPage.jsx",
    "$ProjectRoot\src\components\pages\FreeGamesPage.jsx",
    "$ProjectRoot\src\components\pages\TopSellersPage.jsx",
    "$ProjectRoot\src\components\pages\SearchPage.jsx",
    "$ProjectRoot\src\components\pages\GameDetailsPage.jsx",
    "$ProjectRoot\src\components\pages\LibraryPage.jsx",
    "$ProjectRoot\src\components\pages\DownloadsPage.jsx",
    "$ProjectRoot\src\components\pages\WishlistPage.jsx",
    "$ProjectRoot\src\components\pages\CartPage.jsx",
    "$ProjectRoot\src\components\pages\PurchasesPage.jsx",
    "$ProjectRoot\src\components\pages\ProfilePage.jsx",
    "$ProjectRoot\src\components\pages\AccountPage.jsx",
    "$ProjectRoot\src\components\pages\SettingsPage.jsx",
    "$ProjectRoot\src\components\pages\SecurityPage.jsx",
    "$ProjectRoot\src\components\pages\LoginPage.jsx",
    "$ProjectRoot\src\components\pages\RegisterPage.jsx",
    "$ProjectRoot\src\components\pages\CommunityPage.jsx",
    "$ProjectRoot\src\components\pages\DiscussionsPage.jsx",
    "$ProjectRoot\src\components\pages\ActivityPage.jsx",
    "$ProjectRoot\src\components\pages\FriendsPage.jsx",
    "$ProjectRoot\src\components\pages\GroupsPage.jsx",
    "$ProjectRoot\src\components\pages\ReviewsPage.jsx",
    "$ProjectRoot\src\components\pages\NewsPage.jsx",
    "$ProjectRoot\src\components\pages\EventsPage.jsx",
    "$ProjectRoot\src\components\pages\SupportPage.jsx",
    "$ProjectRoot\src\components\pages\AboutPage.jsx",
    "$ProjectRoot\src\components\pages\NotificationsPage.jsx",
    "$ProjectRoot\src\components\pages\NotFoundPage.jsx",

    # --- admin ---
    "$ProjectRoot\src\components\admin\AdminDashboard.jsx",
    "$ProjectRoot\src\components\admin\AdminGames.jsx",
    "$ProjectRoot\src\components\admin\AdminUsers.jsx",
    "$ProjectRoot\src\components\admin\AdminOrders.jsx",
    "$ProjectRoot\src\components\admin\AdminReports.jsx",
    "$ProjectRoot\src\components\admin\AdminReviews.jsx",
    "$ProjectRoot\src\components\admin\AdminCategories.jsx",
    "$ProjectRoot\src\components\admin\AdminSettings.jsx",
    "$ProjectRoot\src\components\admin\AdminLogs.jsx",

    # --- services ---
    "$ProjectRoot\src\components\services\api.js",
    "$ProjectRoot\src\components\services\authService.js",
    "$ProjectRoot\src\components\services\gameService.js",
    "$ProjectRoot\src\components\services\libraryService.js",
    "$ProjectRoot\src\components\services\wishlistService.js",
    "$ProjectRoot\src\components\services\cartService.js",
    "$ProjectRoot\src\components\services\adminService.js",

    # --- hooks ---
    "$ProjectRoot\src\components\hooks\useAuth.js",
    "$ProjectRoot\src\components\hooks\useGames.js",
    "$ProjectRoot\src\components\hooks\useDebounce.js",
    "$ProjectRoot\src\components\hooks\useToast.js",

    # --- context ---
    "$ProjectRoot\src\components\context\AuthContext.jsx",
    "$ProjectRoot\src\components\context\CartContext.jsx",
    "$ProjectRoot\src\components\context\ThemeContext.jsx",

    # --- config ---
    "$ProjectRoot\src\components\config\config.js",
    "$ProjectRoot\src\components\config\config.example.js",

    # --- styles ---
    "$ProjectRoot\src\components\styles\main.css",
    "$ProjectRoot\src\components\styles\variables.css",
    "$ProjectRoot\src\components\styles\components.css",
    "$ProjectRoot\src\components\styles\pages.css",
    "$ProjectRoot\src\components\styles\admin.css",
    "$ProjectRoot\src\components\styles\responsive.css",

    # --- utils ---
    "$ProjectRoot\src\components\utils\formatters.js",
    "$ProjectRoot\src\components\utils\validators.js",
    "$ProjectRoot\src\components\utils\storage.js",
    "$ProjectRoot\src\components\utils\constants.js",

    # --- game manifest ---
    "$ProjectRoot\game\downloads.json",

    # --- sound README ---
    "$ProjectRoot\sound\README.md"
)

Write-Host "`n--- Fayllar yaratilmoqda ---" -ForegroundColor Cyan
$createdFiles = 0
$existingFiles = 0
foreach ($file in $Files) {
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "[+] Fayl: $file" -ForegroundColor Green
        $createdFiles++
    } else {
        Write-Host "[=] Mavjud: $file" -ForegroundColor Gray
        $existingFiles++
    }
}

# ============================================================
# 4. Tekshiruv
# ============================================================
Write-Host "`n=== STRUKTURA TEKSHIRUVI ===" -ForegroundColor Cyan

$MandatoryChecks = @(
    "$ProjectRoot\src\components\main.jsx",
    "$ProjectRoot\src\components\App.jsx",
    "$ProjectRoot\src\components\pages\HomePage.jsx",
    "$ProjectRoot\src\components\services\api.js",
    "$ProjectRoot\src\components\config\config.js",
    "$ProjectRoot\game\downloads.json",
    "$ProjectRoot\image",
    "$ProjectRoot\sound"
)

$failed = 0
foreach ($path in $MandatoryChecks) {
    if (Test-Path $path) {
        Write-Host "[OK]  $path" -ForegroundColor Green
    } else {
        Write-Host "[XATO] Yo'q: $path" -ForegroundColor Red
        $failed++
    }
}

# ============================================================
# 5. Xulosa
# ============================================================
Write-Host "`n=== XULOSA ===" -ForegroundColor Cyan
Write-Host "Yaratilgan fayllar: $createdFiles" -ForegroundColor Green
Write-Host "Mavjud fayllar:      $existingFiles" -ForegroundColor Gray
Write-Host "Jami papkalar:       $($Directories.Count)" -ForegroundColor Cyan
Write-Host "Jami fayllar:        $($Files.Count)" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "`n[!] $failed ta majburiy element topilmadi!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n[OK] Barcha majburiy fayl va papkalar mavjud." -ForegroundColor Green
    Write-Host "Keyingi qadam: fayllar ichiga kod yozish." -ForegroundColor Yellow
    exit 0
}
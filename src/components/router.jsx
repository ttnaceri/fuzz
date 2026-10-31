import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRoute from './common/ProtectedRoute.jsx';

// --- PUBLIC PAGES ---
import HomePage from './pages/HomePage.jsx';
import StorePage from './pages/StorePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NewReleasesPage from './pages/NewReleasesPage.jsx';
import SpecialOffersPage from './pages/SpecialOffersPage.jsx';
import FreeGamesPage from './pages/FreeGamesPage.jsx';
import TopSellersPage from './pages/TopSellersPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import GameDetailsPage from './pages/GameDetailsPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import DownloadsPage from './pages/DownloadsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PurchasesPage from './pages/PurchasesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SecurityPage from './pages/SecurityPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import DiscussionsPage from './pages/DiscussionsPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// --- AUTH PAGES ---
import LoginPage from './pages/LoginPage.jsx';
import RegisterTelegramPage from './pages/RegisterTelegramPage.jsx';
import RegisterFormPage from './pages/RegisterFormPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ResetPasswordCodePage from './pages/ResetPasswordCodePage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';

// --- ADMIN PAGES ---
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminGames from './admin/AdminGames.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminOrders from './admin/AdminOrders.jsx';
import AdminReports from './admin/AdminReports.jsx';
import AdminReviews from './admin/AdminReviews.jsx';
import AdminCategories from './admin/AdminCategories.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminLogs from './admin/AdminLogs.jsx';
import AdminRate from './admin/AdminRate.jsx';
import AdminPlatform from './admin/AdminPlatform.jsx';
import AdminServer from './admin/AdminServer.jsx';
import AdminTelegram from './admin/AdminTelegram.jsx';
import AdminApi from './admin/AdminApi.jsx';
import AdminWebhooks from './admin/AdminWebhooks.jsx';
import AdminBackend from './admin/AdminBackend.jsx';
import AdminUserLogs from './admin/AdminUserLogs.jsx';
import AdminRoles from './admin/AdminRoles.jsx';
import AdminPermissions from './admin/AdminPermissions.jsx';
import AdminNewGame from './admin/AdminNewGame.jsx';
import AdminBundles from './admin/AdminBundles.jsx';

// --- FOOTER PAGES (To'g'rilangan yo'l: ../footer/...) ---
import FooterAboutPage from '../footer/AboutPage.jsx';
import FooterJobsPage from '../footer/JobsPage.jsx';
import FooterSteamworksPage from '../footer/SteamworksPage.jsx';
import FooterDistributionPage from '../footer/DistributionPage.jsx';
import FooterSupportPage from '../footer/SupportPage.jsx';
import FooterPrivacyPolicyPage from '../footer/PrivacyPolicyPage.jsx';
import FooterLegalPage from '../footer/LegalPage.jsx';
import FooterSubscriberAgreementPage from '../footer/SubscriberAgreementPage.jsx';
import FooterRefundsPage from '../footer/RefundsPage.jsx';
import FooterTermsOfServicePage from '../footer/TermsOfServicePage.jsx';
import FooterCookiePreferencesPage from '../footer/CookiePreferencesPage.jsx';


export const router = createBrowserRouter([
  // 1. AUTH LAYOUT
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterTelegramPage /> },
      { path: '/register/form', element: <RegisterFormPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/reset-password/code', element: <ResetPasswordCodePage /> },
      { path: '/reset-password/change', element: <ChangePasswordPage /> },
    ],
  },

  // 2. MAIN LAYOUT
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'store', element: <StorePage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'new-releases', element: <NewReleasesPage /> },
      { path: 'special-offers', element: <SpecialOffersPage /> },
      { path: 'free-games', element: <FreeGamesPage /> },
      { path: 'top-sellers', element: <TopSellersPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'game/:id', element: <GameDetailsPage /> },
      
      { path: 'library', element: <ProtectedRoute><LibraryPage /></ProtectedRoute> },
      { path: 'downloads', element: <ProtectedRoute><DownloadsPage /></ProtectedRoute> },
      { path: 'wishlist', element: <ProtectedRoute><WishlistPage /></ProtectedRoute> },
      { path: 'cart', element: <CartPage /> },
      { path: 'purchases', element: <ProtectedRoute><PurchasesPage /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'account', element: <ProtectedRoute><AccountPage /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: 'security', element: <ProtectedRoute><SecurityPage /></ProtectedRoute> },
      
      { path: 'community', element: <CommunityPage /> },
      { path: 'discussions', element: <DiscussionsPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'friends', element: <FriendsPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      
      // Footer Routes
      { path: 'footer/about', element: <FooterAboutPage /> },
      { path: 'footer/jobs', element: <FooterJobsPage /> },
      { path: 'footer/steamworks', element: <FooterSteamworksPage /> },
      { path: 'footer/distribution', element: <FooterDistributionPage /> },
      { path: 'footer/support', element: <FooterSupportPage /> },
      { path: 'footer/privacy', element: <FooterPrivacyPolicyPage /> },
      { path: 'footer/legal', element: <FooterLegalPage /> },
      { path: 'footer/subscriber-agreement', element: <FooterSubscriberAgreementPage /> },
      { path: 'footer/refunds', element: <FooterRefundsPage /> },
      { path: 'footer/terms', element: <FooterTermsOfServicePage /> },
      { path: 'footer/cookies', element: <FooterCookiePreferencesPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // 3. ADMIN LAYOUT
  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'games', element: <AdminGames /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'logs', element: <AdminLogs /> },
      { path: 'rate', element: <AdminRate /> },
      { path: 'platform', element: <AdminPlatform /> },
      { path: 'server', element: <AdminServer /> },
      { path: 'telegram', element: <AdminTelegram /> },
      { path: 'api', element: <AdminApi /> },
      { path: 'webhooks', element: <AdminWebhooks /> },
      { path: 'backend', element: <AdminBackend /> },
      { path: 'user-logs', element: <AdminUserLogs /> },
      { path: 'roles', element: <AdminRoles /> },
      { path: 'permissions', element: <AdminPermissions /> },
      { path: 'new-game', element: <AdminNewGame /> },
      { path: 'bundles', element: <AdminBundles /> },
    ],
  },
]);
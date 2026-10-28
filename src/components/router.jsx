import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRoute from './common/ProtectedRoute.jsx';

// Asosiy sahifalar
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

// Auth sahifalari (ResetPasswordPage olib tashlandi)
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

// Admin sahifalari
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminGames from './admin/AdminGames.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminOrders from './admin/AdminOrders.jsx';
import AdminReports from './admin/AdminReports.jsx';
import AdminReviews from './admin/AdminReviews.jsx';
import AdminCategories from './admin/AdminCategories.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminLogs from './admin/AdminLogs.jsx';
import AdminRoles from './admin/AdminRoles.jsx';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      // { path: '/reset-password', element: <ResetPasswordPage /> }, -> Soon bo'lgani uchun o'chirildi
    ],
  },
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
      { path: 'library', element: <LibraryPage /> },
      { path: 'downloads', element: <DownloadsPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>,
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
      { path: 'roles', element: <AdminRoles /> },
    ],
  },
]);
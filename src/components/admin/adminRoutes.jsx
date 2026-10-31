import AdminLayout from '../layouts/AdminLayout.jsx';
import ProtectedRoute from '../common/ProtectedRoute.jsx';

import AdminDashboard from './AdminDashboard.jsx';
import AdminGames from './AdminGames.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminReports from './AdminReports.jsx';
import AdminReviews from './AdminReviews.jsx';
import AdminCategories from './AdminCategories.jsx';
import AdminSettings from './AdminSettings.jsx';
import AdminLogs from './AdminLogs.jsx';
import AdminRate from './AdminRate.jsx';
import AdminPlatform from './AdminPlatform.jsx';
import AdminServer from './AdminServer.jsx';
import AdminTelegram from './AdminTelegram.jsx';
import AdminApi from './AdminApi.jsx';
import AdminWebhooks from './AdminWebhooks.jsx';
import AdminBackend from './AdminBackend.jsx';
import AdminUserLogs from './AdminUserLogs.jsx';
import AdminRoles from './AdminRoles.jsx';
import AdminPermissions from './AdminPermissions.jsx';
import AdminNewGame from './AdminNewGame.jsx';
import AdminBundles from './AdminBundles.jsx';

export const adminRoute = {
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
};
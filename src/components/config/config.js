/**
 * Centralized application configuration.
 * Never store secrets, API keys, or passwords here — this file is public.
 */
export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  // Replace with your real backend base URL.
  // Leave empty to run fully local (three mandatory games still load).
  apiBaseUrl: '',
  apiPrefix: '/api',
  requestTimeout: 15000,
  defaultPageSize: 20,
  // Local manifest — always available
  localManifestUrl: '/game/downloads.json',
  // Sound (optional)
  soundEnabled: false,
};

export default config;
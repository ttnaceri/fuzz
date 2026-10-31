import FooterAboutPage from './AboutPage.jsx';
import FooterJobsPage from './JobsPage.jsx';
import FooterSteamworksPage from './SteamworksPage.jsx';
import FooterDistributionPage from './DistributionPage.jsx';
import FooterSupportPage from './SupportPage.jsx';
import FooterPrivacyPolicyPage from './PrivacyPolicyPage.jsx';
import FooterLegalPage from './LegalPage.jsx';
import FooterSubscriberAgreementPage from './SubscriberAgreementPage.jsx';
import FooterRefundsPage from './RefundsPage.jsx';
import FooterTermsOfServicePage from './TermsOfServicePage.jsx';
import FooterCookiePreferencesPage from './CookiePreferencesPage.jsx';

export const footerRoutes = [
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
];
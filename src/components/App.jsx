import { Component } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { router } from './router.jsx';
import { ToastHost } from './common/Toast.jsx';
import useToast from './hooks/useToast.js';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#100b0a', minHeight: '100vh' }}>
          <h2>Kechirasiz, xatolik yuz berdi!</h2>
          <pre>{this.state.error.toString()}</pre>
          <button onClick={() => window.location.reload()}>Qayta yuklash</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GlobalToastHost() {
  const { toasts, dismiss } = useToast();
  return <ToastHost toasts={toasts} dismiss={dismiss} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <RouterProvider router={router} />
              <GlobalToastHost />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
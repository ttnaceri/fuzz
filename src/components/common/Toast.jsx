import useToast from '../hooks/useToast.js';

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

export function ToastHost({ toasts, dismiss }) {
  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <i className={`fa-solid ${ICONS[t.type] || ICONS.info}`} />
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Toast() {
  const { toasts, dismiss } = useToast();
  return <ToastHost toasts={toasts} dismiss={dismiss} />;
}
import { useCallback, useState } from 'react';

let idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', timeout = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (timeout > 0) {
        setTimeout(() => dismiss(id), timeout);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback((m, t) => push(m, 'success', t), [push]);
  const error = useCallback((m, t) => push(m, 'error', t), [push]);
  const info = useCallback((m, t) => push(m, 'info', t), [push]);
  const warning = useCallback((m, t) => push(m, 'warning', t), [push]);

  return { toasts, push, success, error, info, warning, dismiss };
}

export default useToast;
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const showSuccess = useCallback((title: string, message?: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const showError = useCallback((title: string, message?: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    addToast('info', title, message);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const typeStyles = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            error: 'bg-rose-50 border-rose-200 text-rose-900',
            info: 'bg-blue-50 border-blue-200 text-blue-900',
          };

          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
          }[toast.type];

          const iconColors = {
            success: 'text-emerald-600',
            error: 'text-rose-600',
            info: 'text-brand-600',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all animate-fadeIn ${typeStyles[toast.type]}`}
              role="alert"
            >
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
              <div className="flex-1 text-xs sm:text-sm">
                <p className="font-semibold">{toast.title}</p>
                {toast.message && <p className="mt-0.5 opacity-90">{toast.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

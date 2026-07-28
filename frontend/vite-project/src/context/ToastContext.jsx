import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, className: "bg-success text-white" },
  error: { icon: AlertCircle, className: "bg-destructive text-white" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = {
    showToast,
    success: (message) => showToast(message, "success"),
    error: (message) => showToast(message, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const variant = VARIANTS[toast.type] || VARIANTS.success;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl ${variant.className}`}
              >
                <variant.icon size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

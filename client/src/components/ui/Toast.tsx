import { useState, useEffect, useCallback, useRef } from "react";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let toastFn: ((type: ToastMessage["type"], message: string) => void) | null = null;

export const toast = {
  success: (msg: string) => toastFn?.("success", msg),
  error: (msg: string) => toastFn?.("error", msg),
  info: (msg: string) => toastFn?.("info", msg),
};

const icons = { success: "✅", error: "❌", info: "ℹ️" };
const bgColors = {
  success: "bg-emerald-900/90 border-emerald-500/50",
  error: "bg-red-900/90 border-red-500/50",
  info: "bg-blue-900/90 border-blue-500/50",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timeouts.current.delete(id);
    }, 4000);
    timeouts.current.set(id, t);
  }, []);

  useEffect(() => {
    toastFn = addToast;
    return () => { toastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl ${bgColors[t.type]} animate-slide-in max-w-sm`}
        >
          <span>{icons[t.type]}</span>
          <p className="text-sm text-white font-medium">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

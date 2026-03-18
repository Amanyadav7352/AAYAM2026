'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type Toast = {
  id: string;
  type: 'success' | 'error';
  message: string;
};

let toastListeners: ((toast: Toast) => void)[] = [];

export function toast(type: 'success' | 'error', message: string) {
  const t: Toast = { id: Date.now().toString(), type, message };
  toastListeners.forEach(l => l(t));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => { toastListeners = toastListeners.filter(l => l !== addToast); };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="glass-card rounded-xl flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-sm"
          >
            {t.type === 'success'
              ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
              : <XCircle size={18} className="text-red-400 shrink-0" />}
            <p className="text-sm text-white/90 flex-1">{t.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-white/30 hover:text-white/70"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { apiPost } from '@/lib/utils';

export default function BotFloatingControl() {
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetch('http://localhost:8000/api/bot/status').then(r => r.json());
        setStatus(data.status === 'running' ? 'running' : 'stopped');
      } catch {
        // backend not connected, keep local state
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggle = async () => {
    setLoading(true);
    try {
      if (status === 'running') {
        await apiPost('/api/bot/stop');
        setStatus('stopped');
      } else {
        await apiPost('/api/bot/start');
        setStatus('running');
      }
    } catch {
      // backend may not be connected
      setStatus(prev => prev === 'running' ? 'stopped' : 'running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 glass-card rounded-2xl p-4 min-w-[200px]"
          >
            <p className="text-xs text-white/50 mb-2">Telegram Bot</p>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-medium capitalize">{status}</span>
            </div>
            <button
              onClick={toggle}
              disabled={loading}
              className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                status === 'running'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'gradient-bg text-white hover:opacity-90'
              }`}
            >
              {loading ? '...' : status === 'running' ? 'Stop Bot' : 'Start Bot'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(p => !p)}
        className="relative gradient-bg w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/40"
      >
        <Bot size={24} className="text-white" />
        <span
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#07070f] ${
            status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}
        />
      </motion.button>
    </div>
  );
}

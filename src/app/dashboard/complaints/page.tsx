'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ToastContainer';

type Complaint = {
  id: string;
  description: string;
  severity: 'emergency' | 'high' | 'medium' | 'low';
  category: string;
  status: 'open' | 'resolved';
  created_at: string;
};

const DEMO: Complaint[] = [
  { id: '1', description: 'Sound system failure at Stage B - urgent fix needed', severity: 'emergency', category: 'Technical', status: 'open', created_at: '2025-01-15T12:00:00Z' },
  { id: '2', description: 'Insufficient seating in Workshop Hall C, overflow crowd', severity: 'high', category: 'Logistics', status: 'open', created_at: '2025-01-15T12:30:00Z' },
  { id: '3', description: 'Food quality concerns at canteen stall 3', severity: 'medium', category: 'Catering', status: 'open', created_at: '2025-01-15T13:00:00Z' },
  { id: '4', description: 'Directions to parking area unclear', severity: 'low', category: 'Navigation', status: 'open', created_at: '2025-01-15T13:30:00Z' },
];

const SEVERITY_CONFIG = {
  emergency: { label: '🔴 Emergency', cls: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
  high: { label: '🟠 High', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle },
  medium: { label: '🟡 Medium', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Info },
  low: { label: '🟢 Low', cls: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Info },
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(DEMO);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('complaints').select('*').eq('status', 'open').order('created_at', { ascending: false });
        if (data?.length) setComplaints(data);
      } catch { /* demo mode */ }
    })();
  }, []);

  async function resolve(id: string) {
    try {
      await supabase.from('complaints').update({ status: 'resolved' }).eq('id', id);
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast('success', 'Complaint resolved!');
    } catch {
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast('success', 'Complaint resolved! (demo)');
    }
  }

  const bySeverity = Object.keys(SEVERITY_CONFIG).map(s => ({
    severity: s, count: complaints.filter(c => c.severity === s).length
  }));

  return (
    <div className="py-2">
      <div className="mb-6">
        <p className="text-white/40 text-sm mb-1">Support</p>
        <h1 className="text-3xl font-black gradient-text">Help Desk</h1>
        <p className="text-white/40 text-sm mt-1">{complaints.length} open complaints</p>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {bySeverity.map(({ severity, count }, i) => {
          const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
          return (
            <motion.div key={severity} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card rounded-xl p-3 border ${cfg.cls.split(' ').find(c => c.startsWith('border'))}`}>
              <p className="text-xs mb-1">{cfg.label}</p>
              <p className="text-2xl font-black">{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Complaints list */}
      <div className="space-y-3">
        {complaints.map((c, i) => {
          const cfg = SEVERITY_CONFIG[c.severity];
          return (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-4 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.cls}`}>
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.cls}`}>{cfg.label}</span>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
                <p className="text-sm text-white/80 mb-1">{c.description}</p>
                <p className="text-xs text-white/30">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => resolve(c.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-xs text-green-400 font-semibold hover:bg-green-500/30 transition-all shrink-0"
              >
                <CheckCircle2 size={13} /> Resolve
              </button>
            </motion.div>
          );
        })}
        {complaints.length === 0 && (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-3">
            <CheckCircle2 size={40} className="text-green-400" />
            <p className="text-white/40">All complaints resolved! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

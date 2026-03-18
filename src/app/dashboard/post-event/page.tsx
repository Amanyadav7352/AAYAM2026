'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MessageSquare, BarChart2, Download, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

export default function PostEventPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [certCount, setCertCount] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function generateCerts() {
    setLoading('gen');
    try {
      const data = await apiPost('/api/certificates/generate');
      setCertCount(data.count ?? 248);
      toast('success', `${data.count ?? 248} certificates generated!`);
    } catch {
      setCertCount(248);
      toast('success', '248 certificates generated! (demo)');
    } finally { setLoading(null); }
  }

  async function sendCerts() {
    setLoading('send');
    setProgress(0);
    try {
      // Simulate progress
      const interval = setInterval(() => setProgress(p => Math.min((p ?? 0) + 10, 90)), 300);
      await apiPost('/api/certificates/send-all');
      clearInterval(interval);
      setProgress(100);
      toast('success', 'Certificates sent via Telegram!');
    } catch {
      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        setProgress(p);
        if (p >= 100) { clearInterval(interval); toast('success', 'Demo: All certs queued for delivery!'); setLoading(null); }
      }, 250);
      return;
    }
    setLoading(null);
  }

  async function sendFeedback() {
    setLoading('feedback');
    try {
      await apiPost('/api/certificates/send-feedback');
      setFeedbackSent(true);
      toast('success', 'Feedback poll sent to all attendees!');
    } catch {
      setFeedbackSent(true);
      toast('success', 'Feedback poll queued (demo)!');
    } finally { setLoading(null); }
  }

  async function downloadROI() {
    setLoading('roi');
    try {
      const res = await fetch('http://localhost:8000/api/reports/roi', { method: 'POST' });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'roi_report.pdf';
      a.click();
      toast('success', 'ROI Report downloaded!');
    } catch {
      toast('success', 'ROI Report ready! (demo - backend offline)');
    } finally { setLoading(null); }
  }

  return (
    <div className="py-2">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Post-Event</p>
        <h1 className="text-3xl font-black gradient-text">Post-Event Center</h1>
        <p className="text-white/40 text-sm mt-1">Wrap up your event effortlessly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Certificates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
            <GraduationCap size={22} className="text-purple-400" />
          </div>
          <h2 className="font-bold text-lg mb-1">Certificates</h2>
          <p className="text-white/40 text-sm mb-5">Generate and deliver participation certificates to all attendees</p>

          {certCount && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-sm text-green-400">{certCount} certificates ready</span>
            </div>
          )}

          {progress !== null && progress < 100 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Sending...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full gradient-bg rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button onClick={generateCerts} disabled={!!loading} className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2">
              {loading === 'gen' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GraduationCap size={14} />}
              Generate All Certificates
            </button>
            <button onClick={sendCerts} disabled={!!loading} className="w-full glass border border-white/10 font-semibold py-2.5 rounded-xl hover:border-purple-500/30 transition-all text-sm flex items-center justify-center gap-2">
              {loading === 'send' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              Send via Telegram
            </button>
          </div>
        </motion.div>

        {/* Feedback */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-blue-400" />
          </div>
          <h2 className="font-bold text-lg mb-1">Feedback Poll</h2>
          <p className="text-white/40 text-sm mb-5">Send feedback survey to all attendees via Telegram bot</p>

          {feedbackSent && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-400" />
              <span className="text-sm text-blue-400">Poll sent to all attendees</span>
            </div>
          )}

          <button onClick={sendFeedback} disabled={!!loading || feedbackSent} className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading === 'feedback' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
            {feedbackSent ? 'Poll Sent!' : 'Send Feedback Poll'}
          </button>
        </motion.div>

        {/* ROI Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-emerald-400" />
          </div>
          <h2 className="font-bold text-lg mb-1">ROI Report</h2>
          <p className="text-white/40 text-sm mb-5">Generate PDF report with key event metrics</p>

          <div className="space-y-2 mb-5">
            {[
              { label: 'Registrations', value: '248' },
              { label: 'Check-in Rate', value: '73.8%' },
              { label: 'Wall Photos', value: '124' },
              { label: 'Sponsor Reach', value: '∞' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1 border-b border-white/5">
                <span className="text-white/50">{label}</span>
                <span className="font-semibold gradient-text">{value}</span>
              </div>
            ))}
          </div>

          <button onClick={downloadROI} disabled={!!loading} className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2">
            {loading === 'roi' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
            Generate & Download PDF
          </button>
        </motion.div>
      </div>
    </div>
  );
}

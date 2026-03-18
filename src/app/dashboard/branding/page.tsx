'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, RotateCcw, CheckCircle2, QrCode } from 'lucide-react';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

export default function BrandingPage() {
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [qrUrl, setQrUrl] = useState('https://your-event.vercel.app');

  async function generatePoster() {
    setGenerating(true);
    setApproved(false);
    try {
      await apiPost('/api/branding/generate');
      setPosterUrl(`http://localhost:8000/api/branding/poster?t=${Date.now()}`);
      toast('success', 'Poster generated successfully!');
    } catch {
      // Demo: show placeholder poster
      setPosterUrl('https://placehold.co/800x1100/1e0533/a855f7?text=PFL+Event+Poster&font=montserrat');
      toast('success', 'Demo poster ready!');
    } finally {
      setGenerating(false);
    }
  }

  async function downloadPoster() {
    try {
      const url = `http://localhost:8000/api/branding/poster`;
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event_poster.png';
      a.click();
      toast('success', 'Download started!');
    } catch {
      toast('error', 'Download failed');
    }
  }

  return (
    <div className="py-2">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Branding</p>
        <h1 className="text-3xl font-black gradient-text">Branding & Posters</h1>
        <p className="text-white/40 text-sm mt-1">AI-generated event branding in seconds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poster section */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI Poster Generator
            </h2>

            <button
              onClick={generatePoster}
              disabled={generating}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4"
            >
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate Poster with AI</>
              )}
            </button>

            {posterUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="relative rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img src={posterUrl} alt="Generated Poster" className="w-full object-contain max-h-96" />
                  {approved && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-2xl px-5 py-3">
                        <CheckCircle2 className="text-green-400" size={20} />
                        <span className="font-bold text-green-400">Approved!</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setPosterUrl(null); generatePoster(); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm hover:border-purple-500/30 transition-all">
                    <RotateCcw size={14} /> Regenerate
                  </button>
                  <button onClick={downloadPoster} className="flex-1 flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm hover:border-blue-500/30 transition-all">
                    <Download size={14} /> Download PNG
                  </button>
                  <button
                    onClick={() => { setApproved(true); toast('success', 'Poster approved and ready for sharing!'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/20 border border-green-500/30 rounded-xl text-sm text-green-400 hover:bg-green-500/30 transition-all"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </div>
              </motion.div>
            )}
            {!posterUrl && !generating && (
              <div className="border-2 border-dashed border-white/10 rounded-xl h-48 flex items-center justify-center text-white/30 text-sm">
                Your poster will appear here
              </div>
            )}
          </div>
        </div>

        {/* QR Code section */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <QrCode size={16} className="text-blue-400" />
              Registration QR Code
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <input
                value={qrUrl}
                onChange={e => setQrUrl(e.target.value)}
                placeholder="https://your-event.vercel.app"
                className="flex-1 glass rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-white placeholder-white/30"
              />
            </div>
            <div className="border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 bg-white/5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&bgcolor=07070f&color=a855f7`}
                alt="QR Code"
                className="w-40 h-40 rounded-xl"
              />
              <p className="text-center text-sm text-white/50">Scan = Attendee Registration Page</p>
              <p className="text-xs text-white/30 font-mono break-all text-center">{qrUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

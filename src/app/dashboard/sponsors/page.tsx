'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Mail, Phone, CheckSquare, Square, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

type Sponsor = {
  id: number;
  company: string;
  industry: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  email: string;
  phone?: string;
};

const tierColors: Record<string, string> = {
  Platinum: 'bg-slate-300/20 text-slate-300 border-slate-300/30',
  Gold: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
  Silver: 'bg-gray-300/20 text-gray-300 border-gray-300/30',
  Bronze: 'bg-orange-400/20 text-orange-700 border-orange-400/30',
};

const DEMO_SPONSORS: Sponsor[] = [
  { id: 1, company: 'TechCorp', industry: 'Technology', tier: 'Platinum', email: 'sponsor@techcorp.com', phone: '+91 98765 43210' },
  { id: 2, company: 'StartupHub', industry: 'Venture Capital', tier: 'Gold', email: 'bd@startuphub.io', phone: '+91 87654 32109' },
  { id: 3, company: 'DevTools Inc', industry: 'SaaS', tier: 'Gold', email: 'events@devtools.com' },
  { id: 4, company: 'CloudBase', industry: 'Cloud', tier: 'Silver', email: 'marketing@cloudbase.io', phone: '+91 76543 21098' },
  { id: 5, company: 'ByteWorks', industry: 'Development', tier: 'Silver', email: 'hello@byteworks.dev' },
  { id: 6, company: 'PixelCo', industry: 'Design', tier: 'Bronze', email: 'studio@pixelco.in', phone: '+91 65432 10987' },
];

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(DEMO_SPONSORS);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [callListOpen, setCallListOpen] = useState(false);
  const [emailModal, setEmailModal] = useState<{ open: boolean; preview: string }>({ open: false, preview: '' });
  const [sendModal, setSendModal] = useState(false);
  const [emailCreds, setEmailCreds] = useState({ from: '', password: '' });
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = sponsors.filter(s =>
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.industry.toLowerCase().includes(search.toLowerCase())
  );
  const phoneList = sponsors.filter(s => s.phone);

  function toggleSelect(id: number) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function previewEmail() {
    setLoading('preview');
    try {
      const data = await apiPost('/api/sponsors/preview-email', { sponsor_ids: [...selected] });
      setEmailModal({ open: true, preview: data.preview || 'Dear [Sponsor Name],\n\nWe are excited to invite you to partner with our upcoming event...' });
    } catch {
      setEmailModal({ open: true, preview: 'Dear [Sponsor Name],\n\nWe are excited to invite you to be a sponsor for our upcoming event. As a valued partner, you will receive premium visibility...\n\n[Demo Mode — Backend Offline]' });
    } finally {
      setLoading(null);
    }
  }

  async function sendEmails() {
    setLoading('send');
    try {
      await apiPost('/api/sponsors/send-emails', { sponsor_ids: [...selected], from_email: emailCreds.from, app_password: emailCreds.password });
      toast('success', `Emails sent to ${selected.size} sponsors!`);
      setSendModal(false);
    } catch {
      toast('error', 'Failed to send emails — backend offline?');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="py-2">
      <div className="mb-6">
        <p className="text-white/40 text-sm mb-1">Outreach</p>
        <h1 className="text-3xl font-black gradient-text">Sponsors</h1>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sponsors..."
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-white placeholder-white/30"
          />
        </div>
        {selected.size > 0 && (
          <>
            <button onClick={previewEmail} disabled={loading === 'preview'} className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-white/10 text-sm hover:border-purple-500/30 transition-all">
              <Eye size={14} /> {loading === 'preview' ? 'Loading...' : 'Preview Email'}
            </button>
            <button onClick={() => setSendModal(true)} className="flex items-center gap-2 px-4 py-2.5 gradient-bg rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all">
              <Mail size={14} /> Send to {selected.size}
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left"><button onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)))}><Square size={14} className="text-white/30" /></button></th>
              {['Company', 'Industry', 'Tier', 'Email', 'Phone', ''].map(h => (
                <th key={h} className="p-4 text-left text-xs uppercase text-white/40 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-white/5 hover:bg-white/3 transition-all">
                <td className="p-4">
                  <button onClick={() => toggleSelect(s.id)}>
                    {selected.has(s.id) ? <CheckSquare size={16} className="text-purple-400" /> : <Square size={16} className="text-white/30" />}
                  </button>
                </td>
                <td className="p-4 font-medium">{s.company}</td>
                <td className="p-4 text-white/50 text-sm">{s.industry}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${tierColors[s.tier]}`}>{s.tier}</span>
                </td>
                <td className="p-4 text-sm">
                  <a href={`mailto:${s.email}`} className="text-blue-400 hover:underline">{s.email}</a>
                </td>
                <td className="p-4 text-sm text-white/50">{s.phone || '-'}</td>
                <td className="p-4">
                  <button onClick={() => { setSelected(new Set([s.id])); previewEmail(); }} className="text-xs text-purple-400 hover:underline">Preview</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call List accordion */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button onClick={() => setCallListOpen(p => !p)} className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-all">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-green-400" />
            <span className="font-semibold">📞 Call List ({phoneList.length})</span>
          </div>
          {callListOpen ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </button>
        {callListOpen && (
          <div className="border-t border-white/10 divide-y divide-white/5">
            {phoneList.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-medium text-sm">{s.company}</span>
                <a href={`tel:${s.phone}`} className="text-green-400 text-sm font-mono hover:underline">{s.phone}</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="font-bold text-lg mb-4">Email Preview</h3>
            <pre className="text-sm text-white/70 whitespace-pre-wrap bg-white/5 rounded-xl p-4 max-h-80 overflow-y-auto">{emailModal.preview}</pre>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEmailModal({ open: false, preview: '' })} className="flex-1 py-2.5 glass rounded-xl border border-white/10 text-sm">Close</button>
              <button onClick={() => { setEmailModal({ open: false, preview: '' }); setSendModal(true); }} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold">Send Now</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Send Modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-4">Email Credentials</h3>
            <input value={emailCreds.from} onChange={e => setEmailCreds(p => ({ ...p, from: e.target.value }))} placeholder="From Email" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 mb-3 outline-none text-white placeholder-white/30" />
            <input type="password" value={emailCreds.password} onChange={e => setEmailCreds(p => ({ ...p, password: e.target.value }))} placeholder="App Password" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 mb-4 outline-none text-white placeholder-white/30" />
            <div className="flex gap-3">
              <button onClick={() => setSendModal(false)} className="flex-1 py-2.5 glass rounded-xl border border-white/10 text-sm">Cancel</button>
              <button onClick={sendEmails} disabled={loading === 'send'} className="flex-1 gradient-bg text-white py-2.5 rounded-xl text-sm font-semibold">
                {loading === 'send' ? 'Sending...' : 'Send Emails'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

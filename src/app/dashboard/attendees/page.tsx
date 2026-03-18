'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CheckCircle2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ToastContainer';

type Attendee = {
  id: string;
  name: string;
  email: string;
  checked_in: boolean;
  dynamic_fields?: Record<string, string>;
  created_at: string;
};

const DEMO_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Arjun Sharma', email: 'arjun@example.com', checked_in: true, dynamic_fields: { 'tshirt': 'L', 'meal': 'Veg', 'track': 'AI/ML' }, created_at: '2025-01-15T10:00:00Z' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', checked_in: false, dynamic_fields: { 'tshirt': 'M', 'meal': 'Non-Veg', 'track': 'Web Dev' }, created_at: '2025-01-15T11:00:00Z' },
  { id: '3', name: 'Rahul Kumar', email: 'rahul@example.com', checked_in: true, dynamic_fields: { 'tshirt': 'XL', 'track': 'Blockchain' }, created_at: '2025-01-15T12:00:00Z' },
  { id: '4', name: 'Sneha Iyer', email: 'sneha@example.com', checked_in: false, dynamic_fields: { 'meal': 'Veg', 'track': 'Cloud' }, created_at: '2025-01-16T09:00:00Z' },
  { id: '5', name: 'Karan Singh', email: 'karan@example.com', checked_in: true, dynamic_fields: { 'tshirt': 'S', 'track': 'Cybersecurity' }, created_at: '2025-01-16T10:00:00Z' },
];

const TAG_COLORS = ['bg-purple-500/20 text-purple-300', 'bg-blue-500/20 text-blue-300', 'bg-emerald-500/20 text-emerald-300', 'bg-orange-500/20 text-orange-300', 'bg-pink-500/20 text-pink-300'];

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>(DEMO_ATTENDEES);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: keyof Attendee; dir: 'asc' | 'desc' }>({ key: 'created_at', dir: 'desc' });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('attendees').select('*').order('created_at', { ascending: false }).limit(100);
        if (data?.length) setAttendees(data);
      } catch { /* use demo */ }
    })();
  }, []);

  const filtered = attendees.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const av = a[sort.key] as string;
    const bv = b[sort.key] as string;
    return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  function exportCSV() {
    const headers = ['Name', 'Email', 'Checked In', 'Fields'];
    const rows = attendees.map(a => [a.name, a.email, a.checked_in ? 'Yes' : 'No', JSON.stringify(a.dynamic_fields || {})]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'attendees.csv';
    a.click();
    toast('success', 'CSV exported!');
  }

  return (
    <div className="py-2">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm mb-1">Directory</p>
          <h1 className="text-3xl font-black gradient-text">Attendees</h1>
          <p className="text-white/40 text-sm mt-1">{attendees.length} registered</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-white/10 text-sm hover:border-green-500/30 transition-all mt-1">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-white placeholder-white/30"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Name', 'Email', 'Status', 'Fields'].map(h => (
                <th key={h} className="p-4 text-left text-xs uppercase text-white/40 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-white/5 hover:bg-white/3 transition-all">
                <td className="p-4">
                  <p className="font-medium">{a.name}</p>
                </td>
                <td className="p-4 text-sm text-white/60">{a.email}</td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 text-xs w-fit px-2.5 py-1 rounded-full font-semibold ${a.checked_in ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                    {a.checked_in && <CheckCircle2 size={10} />}
                    {a.checked_in ? 'Checked In' : 'Registered'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(a.dynamic_fields || {}).map(([k, v], ci) => (
                      <span key={k} className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[ci % TAG_COLORS.length]}`}>
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertTriangle, Award, Zap, Activity, Play, Square } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, color, index }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wide font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black gradient-text">{value}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ registrations: 0, checkedIn: 0, complaints: 0, certificates: 0 });
  const [botStatus, setBotStatus] = useState<'running' | 'stopped'>('stopped');
  const [schedulerStatus, setSchedulerStatus] = useState<{ status: string; jobs: number }>({ status: 'stopped', jobs: 0 });
  const [botLoading, setBotLoading] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [activity, setActivity] = useState<{ type: string; message: string; time: string }[]>([]);

  useEffect(() => {
    fetchStats();
    fetchBotStatus();
    fetchSchedulerStatus();
  }, []);

  async function fetchStats() {
    try {
      const [{ count: reg }, { count: checkin }, { count: comp }, { count: certs }] = await Promise.all([
        supabase.from('attendees').select('*', { count: 'exact', head: true }),
        supabase.from('attendees').select('*', { count: 'exact', head: true }).eq('checked_in', true),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ registrations: reg || 0, checkedIn: checkin || 0, complaints: comp || 0, certificates: certs || 0 });

      // Activity feed from complaints and wall
      const { data: recentComplaints } = await supabase.from('complaints').select('description,created_at').order('created_at', { ascending: false }).limit(3);
      const { data: recentPhotos } = await supabase.from('wall_photos').select('photo_url,created_at').order('created_at', { ascending: false }).limit(3);
      const feed = [
        ...(recentComplaints || []).map(c => ({ type: 'complaint', message: c.description?.slice(0, 60) + '...', time: c.created_at })),
        ...(recentPhotos || []).map(p => ({ type: 'photo', message: 'New wall photo submitted', time: p.created_at })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
      setActivity(feed);
    } catch {
      // Supabase not configured — use demo data
      setStats({ registrations: 248, checkedIn: 183, complaints: 4, certificates: 221 });
    }
  }

  async function fetchBotStatus() {
    try {
      const data = await fetch('http://localhost:8000/api/bot/status').then(r => r.json());
      setBotStatus(data.status === 'running' ? 'running' : 'stopped');
    } catch { /* backend offline */ }
  }

  async function fetchSchedulerStatus() {
    try {
      const data = await fetch('http://localhost:8000/api/scheduler/status').then(r => r.json());
      setSchedulerStatus({ status: data.status, jobs: data.jobs?.length ?? 0 });
    } catch { /* backend offline */ }
  }

  async function toggleBot() {
    setBotLoading(true);
    try {
      if (botStatus === 'running') {
        await apiPost('/api/bot/stop');
        setBotStatus('stopped');
        toast('success', 'Bot stopped successfully');
      } else {
        await apiPost('/api/bot/start');
        setBotStatus('running');
        toast('success', 'Bot started successfully');
      }
    } catch {
      toast('error', 'Failed to toggle bot — backend offline?');
    } finally {
      setBotLoading(false);
    }
  }

  async function toggleScheduler() {
    setSchedulerLoading(true);
    try {
      if (schedulerStatus.status === 'running') {
        await apiPost('/api/scheduler/stop');
        setSchedulerStatus(s => ({ ...s, status: 'stopped' }));
        toast('success', 'Scheduler stopped');
      } else {
        await apiPost('/api/scheduler/start');
        setSchedulerStatus(s => ({ ...s, status: 'running' }));
        toast('success', 'Scheduler started');
      }
    } catch {
      toast('error', 'Failed to toggle scheduler');
    } finally {
      setSchedulerLoading(false);
    }
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Overview</p>
        <h1 className="text-3xl font-black gradient-text">Event Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Manage Events. Effortlessly.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Registrations" value={stats.registrations} color="bg-purple-500/30" index={0} />
        <StatCard icon={CheckCircle2} label="Checked In" value={stats.checkedIn} color="bg-blue-500/30" index={1} />
        <StatCard icon={AlertTriangle} label="Open Complaints" value={stats.complaints} color="bg-orange-500/30" index={2} />
        <StatCard icon={Award} label="Certificates" value={stats.certificates} color="bg-emerald-500/30" index={3} />
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Bot Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-purple-400" />
            <h2 className="font-bold">Telegram Bot</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${botStatus === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm capitalize font-medium">{botStatus}</span>
            </div>
            <button
              onClick={toggleBot}
              disabled={botLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                botStatus === 'running'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                  : 'gradient-bg text-white hover:opacity-90'
              }`}
            >
              {botStatus === 'running' ? <Square size={12} /> : <Play size={12} />}
              {botLoading ? 'Loading...' : botStatus === 'running' ? 'Stop' : 'Start'}
            </button>
          </div>
        </motion.div>

        {/* Scheduler Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={18} className="text-blue-400" />
            <h2 className="font-bold">Announcement Scheduler</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-3 h-3 rounded-full ${schedulerStatus.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm capitalize font-medium">{schedulerStatus.status}</span>
              </div>
              <p className="text-xs text-white/40">{schedulerStatus.jobs} jobs scheduled</p>
            </div>
            <button
              onClick={toggleScheduler}
              disabled={schedulerLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                schedulerStatus.status === 'running'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                  : 'gradient-bg text-white hover:opacity-90'
              }`}
            >
              {schedulerStatus.status === 'running' ? <Square size={12} /> : <Play size={12} />}
              {schedulerLoading ? 'Loading...' : schedulerStatus.status === 'running' ? 'Stop' : 'Start'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {activity.length === 0 ? (
            // Demo activity items
            [
              { type: 'complaint', message: 'Sound system issue reported at Stage B...', time: '2 min ago' },
              { type: 'photo', message: 'New wall photo submitted', time: '5 min ago' },
              { type: 'complaint', message: 'Registration help requested at Gate 2...', time: '12 min ago' },
              { type: 'photo', message: 'New wall photo submitted', time: '18 min ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'complaint' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                <div className="flex-1">
                  <p className="text-sm text-white/80">{item.message}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.time}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'complaint' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {item.type === 'complaint' ? 'Complaint' : 'Photo'}
                </span>
              </div>
            ))
          ) : activity.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'complaint' ? 'bg-orange-400' : 'bg-blue-400'}`} />
              <div className="flex-1">
                <p className="text-sm text-white/80">{item.message}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Zap } from 'lucide-react';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

type Job = { id: string; title: string; time: string; auto_announce: boolean; channel?: string };

const DEMO_JOBS: Job[] = [
  { id: '1', title: 'Opening Ceremony', time: '09:00', auto_announce: true, channel: '#tech-fest' },
  { id: '2', title: 'Keynote Address', time: '10:00', auto_announce: true, channel: '#tech-fest' },
  { id: '3', title: 'Workshop Session A', time: '11:30', auto_announce: false },
  { id: '4', title: 'Lunch Break', time: '13:00', auto_announce: true, channel: '#announcements' },
  { id: '5', title: 'Panel Discussion', time: '14:00', auto_announce: false },
  { id: '6', title: 'Hackathon Judging', time: '16:00', auto_announce: true, channel: '#hackathon' },
  { id: '7', title: 'Prize Distribution', time: '17:30', auto_announce: true, channel: '#tech-fest' },
  { id: '8', title: 'Closing Ceremony', time: '18:30', auto_announce: true, channel: '#tech-fest' },
];

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>(DEMO_JOBS);
  const [schedulerStatus, setSchedulerStatus] = useState<'running' | 'stopped'>('stopped');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch('http://localhost:8000/api/scheduler/status').then(r => r.json());
        setSchedulerStatus(data.status === 'running' ? 'running' : 'stopped');
        if (data.jobs?.length) setJobs(data.jobs);
      } catch { /* demo */ }
    })();
  }, []);

  async function toggleScheduler() {
    setLoading('scheduler');
    try {
      if (schedulerStatus === 'running') {
        await apiPost('/api/scheduler/stop');
        setSchedulerStatus('stopped');
        toast('success', 'Scheduler stopped');
      } else {
        await apiPost('/api/scheduler/start');
        setSchedulerStatus('running');
        toast('success', 'Scheduler started!');
      }
    } catch {
      toast('error', 'Backend offline');
      setSchedulerStatus(s => s === 'running' ? 'stopped' : 'running');
    } finally { setLoading(null); }
  }

  async function testBlast(job: Job) {
    setLoading(job.id);
    try {
      await apiPost('/api/scheduler/blast', { message: `📢 ${job.title}`, at_time: job.time });
      toast('success', `Test blast sent for "${job.title}"`);
    } catch {
      toast('success', `Test blast queued (demo): "${job.title}"`);
    } finally { setLoading(null); }
  }

  function toggleAutoAnnounce(id: string) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, auto_announce: !j.auto_announce } : j));
  }

  return (
    <div className="py-2">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-white/40 text-sm mb-1">Timeline</p>
          <h1 className="text-3xl font-black gradient-text">Schedule & Announcements</h1>
        </div>

        {/* Scheduler Card */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`w-2.5 h-2.5 rounded-full ${schedulerStatus === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-bold capitalize">Scheduler {schedulerStatus}</span>
            </div>
            <p className="text-xs text-white/40">{jobs.filter(j => j.auto_announce).length} auto-announce slots</p>
          </div>
          <button
            onClick={toggleScheduler}
            disabled={loading === 'scheduler'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              schedulerStatus === 'running'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'gradient-bg text-white hover:opacity-90'
            }`}
          >
            {schedulerStatus === 'running' ? <><Square size={11} /> Stop</> : <><Play size={11} /> Start</>}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 to-transparent" />
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4">
              <div className="w-16 text-right shrink-0">
                <span className="text-sm font-mono gradient-text font-bold">{job.time}</span>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 z-10 ${job.auto_announce ? 'border-purple-400 bg-purple-400/30' : 'border-white/30 bg-transparent'}`} />
              <div className="flex-1 glass-card rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{job.title}</p>
                  {job.channel && <p className="text-xs text-white/40 mt-0.5">{job.channel}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAutoAnnounce(job.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                      job.auto_announce
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    📢 Auto
                  </button>
                  <button
                    onClick={() => testBlast(job)}
                    disabled={loading === job.id}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Zap size={11} />
                    {loading === job.id ? '...' : 'Blast'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

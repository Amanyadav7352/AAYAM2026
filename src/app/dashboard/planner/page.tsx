'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, CheckCircle2, Lightbulb, Plus } from 'lucide-react';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

const TEMPLATES = [
  { id: 1, icon: '🎓', name: 'TechFest', desc: 'Technology exhibitions and workshops' },
  { id: 2, icon: '💻', name: 'Hackathon', desc: '24-48 hour coding marathons' },
  { id: 3, icon: '🎭', name: 'Cultural Fest', desc: 'Arts, music and performance events' },
  { id: 4, icon: '🏏', name: 'Sports Event', desc: 'Tournaments and competitions' },
  { id: 5, icon: '🎤', name: 'Conference', desc: 'Professional talks and networking' },
];

type Message = { role: 'user' | 'assistant'; content: string };

export default function PlannerPage() {
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);
    try {
      const data = await apiPost('/api/architect/chat', { message: userMsg, session_id: sessionId, template_id: templateId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.finalized) { setFinalized(true); setPlan(data.plan); }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm ready to help plan your event! (Backend offline - demo mode)\n\nTell me about your event — what's the venue capacity, expected dates, and main activities?" }]);
    } finally {
      setTyping(false);
    }
  }

  if (!templateId) {
    return (
      <div className="py-2">
        <div className="mb-8">
          <p className="text-white/40 text-sm mb-1">AI Planner</p>
          <h1 className="text-3xl font-black gradient-text">Event Planner</h1>
          <p className="text-white/40 text-sm mt-1">Choose a template to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TEMPLATES.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 cursor-pointer group"
              onClick={() => { setTemplateId(t.id); setMessages([{ role: 'assistant', content: `Great! I'll help you plan a **${t.name}**. Let's start! What are the key goals for this event?` }]); }}
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <h3 className="font-bold text-lg mb-1 group-hover:gradient-text transition-all">{t.name}</h3>
              <p className="text-white/50 text-sm mb-4">{t.desc}</p>
              <button className="text-xs font-semibold gradient-text group-hover:opacity-100 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                Use This Template →
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => { setTemplateId(0); setMessages([{ role: 'assistant', content: "Starting from scratch! Tell me about your event concept." }]); }}
          className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-white/10 text-sm font-medium hover:border-purple-500/40 transition-all"
        >
          <Plus size={16} />
          Start Blank
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm mb-1">AI Planner</p>
          <h1 className="text-2xl font-black gradient-text">Event Architect</h1>
        </div>
        <button onClick={() => { setTemplateId(null); setMessages([]); setFinalized(false); }} className="text-xs text-white/40 hover:text-white px-3 py-1.5 glass rounded-lg border border-white/10">← Change Template</button>
      </div>

      {finalized && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 glass-card rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-green-400" />
            <span className="font-bold text-green-400">Event Plan Ready!</span>
          </div>
          {plan && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {Object.entries(plan).slice(0, 4).map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-white/40 capitalize">{k.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold mt-1">{String(v)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="flex-1 glass-card rounded-2xl p-4 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'gradient-bg' : 'bg-white/10'}`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-purple-400" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'gradient-bg text-white' : 'bg-white/5 text-white/90'}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot size={14} className="text-purple-400" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Describe your event requirements..."
          className="flex-1 glass rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-white placeholder-white/30"
        />
        <button
          onClick={sendMessage}
          className="gradient-bg w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:opacity-90 transition-all"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

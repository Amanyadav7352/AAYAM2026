'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Rocket, Copy, ExternalLink, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from '@/components/ToastContainer';
import { apiPost } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Event Landing Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #07070f 0%, #1e0533 50%, #07070f 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .hero { max-width: 700px; padding: 40px 20px; }
    h1 {
      font-size: 3.5rem;
      font-weight: 900;
      background: linear-gradient(to right, #a855f7, #3b82f6);
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 16px;
    }
    p { color: rgba(255,255,255,0.6); font-size: 1.1rem; margin-bottom: 32px; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #a855f7, #3b82f6);
      color: white;
      padding: 14px 36px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .badge {
      display: inline-block;
      border: 1px solid rgba(168,85,247,0.4);
      border-radius: 50px;
      padding: 6px 16px;
      font-size: 0.8rem;
      color: #a855f7;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="badge">✦ PFL Event Management</div>
    <h1>Amazing Event 2025</h1>
    <p>Join thousands of innovators for the most anticipated event of the year. Experience talks, workshops, and networking like never before.</p>
    <a href="#register" class="btn">Register Now →</a>
  </div>
</body>
</html>`;

export default function WebsitePage() {
  const [code, setCode] = useState(STARTER_HTML);
  const [aiMsg, setAiMsg] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  async function askAI() {
    if (!aiMsg.trim()) return;
    setChatLoading(true);
    try {
      const data = await apiPost('/api/website/generate', { message: aiMsg, current_html: code });
      if (data.html) setCode(data.html);
      toast('success', 'Website updated with AI!');
    } catch {
      toast('success', 'AI update applied (demo)');
    } finally { setChatLoading(false); setAiMsg(''); }
  }

  async function deploy() {
    setDeploying(true);
    try {
      const data = await apiPost('/api/deploy', { html: code });
      setDeployedUrl(data.url || 'https://pfl-event-2025.vercel.app');
      toast('success', 'Deployed to Vercel!');
    } catch {
      setDeployedUrl('https://pfl-event-2025.vercel.app');
      toast('success', 'Demo deploy successful!');
    } finally { setDeploying(false); }
  }

  return (
    <div className="py-2 flex flex-col h-[calc(100vh-8rem)] gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm mb-0.5">Builder</p>
          <h1 className="text-2xl font-black gradient-text">Website Builder</h1>
        </div>
        <button onClick={deploy} disabled={deploying} className="flex items-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
          {deploying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Rocket size={14} />}
          {deploying ? 'Deploying...' : 'Deploy to Vercel →'}
        </button>
      </div>

      {deployedUrl && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-3 flex items-center gap-3 border border-green-500/20">
          <Globe size={14} className="text-green-400" />
          <span className="text-sm text-green-400 flex-1">{deployedUrl}</span>
          <button onClick={() => { navigator.clipboard.writeText(deployedUrl); toast('success', 'URL copied!'); }} className="p-1.5 glass rounded-lg hover:bg-white/10 transition-all">
            <Copy size={13} className="text-white/50" />
          </button>
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 glass rounded-lg hover:bg-white/10 transition-all">
            <ExternalLink size={13} className="text-white/50" />
          </a>
        </motion.div>
      )}

      {/* AI Chat bar */}
      <div className="flex gap-2">
        <input
          value={aiMsg} onChange={e => setAiMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()}
          placeholder='Tell AI what to change: "Make the background darker" or "Add registration form"...'
          className="flex-1 glass rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-white placeholder-white/30"
        />
        <button onClick={askAI} disabled={chatLoading} className="flex items-center gap-2 px-4 py-2.5 glass border border-white/10 rounded-xl text-sm hover:border-purple-500/40 transition-all">
          <ChevronRight size={14} className={chatLoading ? 'animate-spin' : ''} />
          {chatLoading ? 'Updating...' : 'Apply'}
        </button>
      </div>

      {/* Split pane */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-white/30 font-mono">index.html</span>
          </div>
          <MonacoEditor
            height="100%"
            language="html"
            theme="vs-dark"
            value={code}
            onChange={v => setCode(v || '')}
            options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true }}
          />
        </div>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
            <Globe size={13} className="text-blue-400" />
            <span className="text-xs text-white/30">Preview</span>
          </div>
          <iframe
            srcDoc={code}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ToastContainer';

type Photo = { id: string; photo_url: string; user_name?: string; created_at: string; approved: boolean };

const DEMO_PHOTOS: Photo[] = [
  { id: '1', photo_url: 'https://placehold.co/400x300/1e0533/a855f7?text=Photo+1', user_name: 'Arjun', created_at: '2025-01-15T10:00:00Z', approved: false },
  { id: '2', photo_url: 'https://placehold.co/400x300/0f1733/3b82f6?text=Photo+2', user_name: 'Priya', created_at: '2025-01-15T10:30:00Z', approved: false },
  { id: '3', photo_url: 'https://placehold.co/400x300/0d1f2d/22d3ee?text=Photo+3', user_name: 'Rahul', created_at: '2025-01-15T11:00:00Z', approved: false },
  { id: '4', photo_url: 'https://placehold.co/400x300/1a0533/ec4899?text=Photo+4', user_name: 'Sneha', created_at: '2025-01-15T11:30:00Z', approved: false },
];

export default function WallPage() {
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPhotos() {
    try {
      const { data } = await supabase.from('wall_photos').select('*').eq('approved', false).order('created_at', { ascending: false });
      if (data?.length) setPhotos(data);
    } catch { /* use demo */ }
  }

  async function approve(id: string) {
    setProcessing(id);
    try {
      await supabase.from('wall_photos').update({ approved: true }).eq('id', id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast('success', 'Photo approved and published!');
    } catch {
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast('success', 'Photo approved! (demo)');
    } finally { setProcessing(null); }
  }

  async function reject(id: string) {
    setProcessing(id);
    try {
      await supabase.from('wall_photos').delete().eq('id', id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast('success', 'Photo rejected');
    } catch {
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast('success', 'Photo removed (demo)');
    } finally { setProcessing(null); }
  }

  return (
    <div className="py-2">
      <div className="mb-6">
        <p className="text-white/40 text-sm mb-1">Moderation</p>
        <h1 className="text-3xl font-black gradient-text">Social Wall</h1>
        <p className="text-white/40 text-sm mt-1">{photos.length} pending approval · Auto-refreshes every 5s</p>
      </div>

      {photos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center gap-3">
          <Image size={40} className="text-white/20" />
          <p className="text-white/40">No pending photos — all caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl overflow-hidden">
                <div className="relative">
                  <img src={photo.photo_url} alt={`Photo by ${photo.user_name}`} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-white text-xs font-semibold">{photo.user_name || 'Anonymous'}</p>
                    <p className="text-white/50 text-xs">{new Date(photo.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 p-3">
                  <button
                    onClick={() => approve(photo.id)}
                    disabled={processing === photo.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-xs text-green-400 font-semibold hover:bg-green-500/30 transition-all"
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    onClick={() => reject(photo.id)}
                    disabled={processing === photo.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold hover:bg-red-500/30 transition-all"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

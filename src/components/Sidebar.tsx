'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarCheck2,
  Globe,
  Palette,
  Handshake,
  Users,
  Camera,
  HeadphonesIcon,
  CalendarClock,
  GraduationCap,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CalendarCheck2, label: 'Event Planner', href: '/dashboard/planner' },
  { icon: Globe, label: 'Website Builder', href: '/dashboard/website' },
  { icon: Palette, label: 'Branding', href: '/dashboard/branding' },
  { icon: Handshake, label: 'Sponsors', href: '/dashboard/sponsors' },
  { icon: Users, label: 'Attendees', href: '/dashboard/attendees' },
  { icon: Camera, label: 'Social Wall', href: '/dashboard/wall' },
  { icon: HeadphonesIcon, label: 'Help Desk', href: '/dashboard/complaints' },
  { icon: CalendarClock, label: 'Schedule', href: '/dashboard/schedule' },
  { icon: GraduationCap, label: 'Post-Event', href: '/dashboard/post-event' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-full w-64 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/30">
            P
          </div>
          <div>
            <span className="text-xl font-black gradient-text">PFL</span>
            <p className="text-xs text-white/40 leading-tight">Event Management</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className="px-3 space-y-1">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-purple-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-all',
                    isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

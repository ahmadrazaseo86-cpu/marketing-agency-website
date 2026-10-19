'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Plus,
  MessageSquare,
  User,
  LogOut,
  ExternalLink,
  Sparkles,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface TopAdminBarProps {
  user?: {
    username: string;
    displayName: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
  pendingCommentsCount?: number;
}

export default function TopAdminBar({ user, pendingCommentsCount = 0 }: TopAdminBarProps) {
  const router = useRouter();
  const toast = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const siteMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setNewMenuOpen(false);
      }
      if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
        setSiteMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('You have been logged out.');
      router.push('/wp-login');
      router.refresh();
    } catch (err) {
      router.push('/wp-login');
    }
  };

  return (
    <div className="h-8 bg-[#0f172a] text-[#94a3b8] text-[13px] flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-50 select-none border-b border-[#1e293b]">
      {/* Left Menu Items */}
      <div className="flex items-center space-x-1 h-full">
        {/* NexaRank Logo */}
        <Link
          href="/wp-admin"
          className="flex items-center gap-1.5 px-2.5 h-full bg-[#1e293b] hover:bg-[#2563eb] text-white transition-colors font-bold text-xs"
          title="NexaRank Dashboard"
        >
          <div className="w-4 h-4 rounded bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white text-[10px] font-black">
            N
          </div>
          <span className="tracking-wide">NexaRank</span>
        </Link>

        {/* Site Name Dropdown */}
        <div className="relative h-full" ref={siteMenuRef}>
          <button
            onClick={() => setSiteMenuOpen(!siteMenuOpen)}
            className="flex items-center gap-1.5 h-full px-2.5 hover:bg-[#2563eb] hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-semibold text-white">NexaRank Agency</span>
          </button>
          {siteMenuOpen && (
            <div className="absolute left-0 top-8 bg-[#1e293b] text-white shadow-xl border border-[#334155] min-w-[160px] py-1 z-50 rounded-b">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setSiteMenuOpen(false)}
              >
                <span>Visit NexaRank Website</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8]" />
              </Link>
              <Link
                href="/wp-admin/builder"
                className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setSiteMenuOpen(false)}
              >
                <span>Live Element Editor</span>
                <Sparkles className="w-3 h-3 text-[#38bdf8]" />
              </Link>
            </div>
          )}
        </div>

        {/* Pending Comments Bubble */}
        <Link
          href="/wp-admin/comments"
          className="flex items-center gap-1 h-full px-2.5 hover:bg-[#2563eb] hover:text-white transition-colors"
          title={`${pendingCommentsCount} comments awaiting moderation`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {pendingCommentsCount > 0 && (
            <span className="bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingCommentsCount}
            </span>
          )}
        </Link>

        {/* SEO Dashboard Shortcut */}
        <Link
          href="/wp-admin/seo"
          className="flex items-center gap-1 h-full px-2.5 hover:bg-[#2563eb] hover:text-white transition-colors text-xs text-[#38bdf8]"
          title="NexaRank SEO Suite"
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO Suite</span>
        </Link>

        {/* + New Dropdown */}
        <div className="relative h-full" ref={newMenuRef}>
          <button
            onClick={() => setNewMenuOpen(!newMenuOpen)}
            className="flex items-center gap-1 h-full px-2.5 hover:bg-[#2563eb] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          {newMenuOpen && (
            <div className="absolute left-0 top-8 bg-[#1e293b] text-white shadow-xl border border-[#334155] min-w-[130px] py-1 z-50 rounded-b">
              <Link
                href="/wp-admin/posts/new"
                className="block px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setNewMenuOpen(false)}
              >
                Post
              </Link>
              <Link
                href="/wp-admin/pages/new"
                className="block px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setNewMenuOpen(false)}
              >
                Page
              </Link>
              <Link
                href="/wp-admin/media"
                className="block px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setNewMenuOpen(false)}
              >
                Media
              </Link>
              <Link
                href="/wp-admin/users/new"
                className="block px-3 py-1.5 text-xs hover:bg-[#2563eb]"
                onClick={() => setNewMenuOpen(false)}
              >
                User
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right User Menu */}
      <div className="relative h-full" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 h-full px-2.5 hover:bg-[#2563eb] hover:text-white transition-colors"
        >
          <span>
            Howdy, <strong className="text-white">{user?.displayName || user?.username || 'Admin'}</strong>
          </span>
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop'}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover border border-[#475569]"
          />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-8 bg-[#1e293b] text-white shadow-xl border border-[#334155] w-56 p-4 z-50 rounded-b">
            <div className="flex items-center gap-3 pb-3 border-b border-[#334155] mb-3">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{user?.displayName || 'Administrator'}</div>
                <div className="text-[11px] text-[#94a3b8] truncate">@{user?.username || 'admin'}</div>
                <div className="text-[10px] text-[#38bdf8] uppercase font-semibold mt-0.5">{user?.role}</div>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/wp-admin/profile"
                className="flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-[#2563eb] transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <User className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-[#ef4444] text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

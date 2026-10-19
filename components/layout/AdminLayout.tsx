'use client';

import React, { useEffect, useState } from 'react';
import TopAdminBar from './TopAdminBar';
import Sidebar from './Sidebar';
import ScreenOptionsHelp from './ScreenOptionsHelp';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [pendingCommentsCount, setPendingCommentsCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadCommentCount() {
      try {
        const res = await fetch('/api/comments?status=PENDING');
        if (res.ok) {
          const data = await res.json();
          setPendingCommentsCount(data.total || 0);
        }
      } catch (e) {}
    }

    loadCurrentUser();
    loadCommentCount();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338]">
      {/* Top Admin Bar */}
      <TopAdminBar user={user} pendingCommentsCount={pendingCommentsCount} />

      {/* Main Container */}
      <div className="flex pt-8 min-h-screen">
        {/* Left Sidebar */}
        <Sidebar userRole={user?.role || 'ADMINISTRATOR'} pendingCommentsCount={pendingCommentsCount} />

        {/* Content Area */}
        <main className="flex-1 ml-44 p-6 overflow-x-hidden min-h-[calc(100vh-32px)]">
          <ScreenOptionsHelp />
          {children}
        </main>
      </div>
    </div>
  );
}

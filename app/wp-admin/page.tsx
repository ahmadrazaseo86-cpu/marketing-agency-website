'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Pin,
  FileText,
  MessageSquare,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  Trash2,
  ThumbsUp,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // Quick Draft State
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) {
      toast.error('Please enter a draft title.');
      return;
    }

    setSavingDraft(true);
    try {
      const res = await fetch('/api/dashboard/quick-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle, content: draftContent }),
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to save');

      toast.success('Draft saved successfully!');
      setDraftTitle('');
      setDraftContent('');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Could not save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleModerateComment = async (commentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Comment status updated to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update comment status');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1200px]">
        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-[23px] font-normal text-[#1d2327]">Dashboard</h1>
        </div>

        {/* Welcome Panel */}
        {showWelcome && (
          <div className="postbox relative p-6 mb-5 border border-[#c3c4c7] shadow-sm bg-white">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-[#787c82] hover:text-[#1d2327]"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[19px] font-normal text-[#1d2327] mb-1">
              Welcome to WordPress!
            </h2>
            <p className="text-[#646970] text-[13px] mb-6">
              We’ve assembled some links to get you started:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px]">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-[#1d2327]">Get Started</h3>
                <Link
                  href="/wp-admin/appearance/customize"
                  className="button-primary mb-3 text-[13px]"
                >
                  Customize Your Site
                </Link>
                <div className="text-[#646970] text-xs">
                  or,{' '}
                  <Link href="/wp-admin/themes" className="text-[#2271b1] hover:underline">
                    change your theme completely
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-[#1d2327]">Next Steps</h3>
                <ul className="space-y-2 text-[#2271b1]">
                  <li>
                    <Link href="/wp-admin/posts/new" className="hover:underline flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-[#646970]" />
                      <span>Write your first blog post</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/wp-admin/pages/new" className="hover:underline flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#646970]" />
                      <span>Add an About page</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/wp-admin/appearance/menus" className="hover:underline flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#646970]" />
                      <span>Set up your navigation menu</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-[#1d2327]">More Actions</h3>
                <ul className="space-y-2 text-[#2271b1]">
                  <li>
                    <Link href="/wp-admin/plugins" className="hover:underline">
                      Manage installed plugins
                    </Link>
                  </li>
                  <li>
                    <Link href="/wp-admin/comments" className="hover:underline">
                      Turn comments on or off
                    </Link>
                  </li>
                  <li>
                    <Link href="/wp-admin/settings" className="hover:underline">
                      Configure site settings
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Widget: At a Glance */}
            <div className="postbox">
              <div className="postbox-header">
                <span>At a Glance</span>
              </div>
              <div className="postbox-content">
                <div className="grid grid-cols-2 gap-y-3 pb-4 border-b border-[#f0f0f1]">
                  <Link
                    href="/wp-admin/posts"
                    className="flex items-center gap-2 text-[#2271b1] hover:underline"
                  >
                    <Pin className="w-4 h-4 text-[#8c8f94]" />
                    <span>{data?.counts?.publishedPosts || 0} Posts</span>
                  </Link>

                  <Link
                    href="/wp-admin/pages"
                    className="flex items-center gap-2 text-[#2271b1] hover:underline"
                  >
                    <FileText className="w-4 h-4 text-[#8c8f94]" />
                    <span>{data?.counts?.totalPages || 0} Pages</span>
                  </Link>

                  <Link
                    href="/wp-admin/comments"
                    className="flex items-center gap-2 text-[#2271b1] hover:underline"
                  >
                    <MessageSquare className="w-4 h-4 text-[#8c8f94]" />
                    <span>{data?.counts?.totalComments || 0} Comments</span>
                  </Link>

                  <Link
                    href="/wp-admin/comments?status=PENDING"
                    className="flex items-center gap-2 text-[#d63638] hover:underline"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#d63638]" />
                    <span>{data?.counts?.pendingComments || 0} Pending</span>
                  </Link>
                </div>

                <div className="pt-3 text-xs text-[#646970]">
                  WordPress {data?.wordpressVersion || '6.6.2'} running{' '}
                  <strong className="text-[#1d2327]">{data?.activeTheme || 'Twenty Twenty-Four'}</strong> theme.
                </div>
              </div>
            </div>

            {/* Widget: Activity */}
            <div className="postbox">
              <div className="postbox-header">
                <span>Activity</span>
              </div>
              <div className="postbox-content">
                <div className="text-xs font-semibold uppercase text-[#646970] mb-2">
                  Recently Published
                </div>
                <div className="divide-y divide-[#f0f0f1]">
                  {data?.recentPosts?.map((post: any) => (
                    <div key={post.id} className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs text-[#8c8f94] mr-2">
                          {formatDate(post.createdAt)}
                        </span>
                        <Link
                          href={`/wp-admin/posts/${post.id}`}
                          className="font-medium text-[#2271b1] hover:underline text-[13px]"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <span className="text-xs text-[#8c8f94] shrink-0">
                        by {post.author?.displayName || 'Admin'}
                      </span>
                    </div>
                  ))}
                  {(!data?.recentPosts || data.recentPosts.length === 0) && (
                    <div className="py-3 text-xs text-[#8c8f94]">No published posts yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Widget: Site Health Status */}
            <div className="postbox">
              <div className="postbox-header">
                <span>Site Health Status</span>
              </div>
              <div className="postbox-content">
                <div className="flex items-center gap-3 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded mb-3">
                  <ShieldCheck className="w-6 h-6 text-[#16a34a]" />
                  <div>
                    <div className="font-semibold text-sm text-[#166534]">Good</div>
                    <div className="text-xs text-[#15803d]">
                      Your site is healthy and all system checks have passed.
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-[#646970]">
                  <div>✔ SQLite Database Connected</div>
                  <div>✔ Next.js App Router Active</div>
                  <div>✔ Security Headers & JWT Auth Enabled</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Widget: Quick Draft */}
            <div className="postbox">
              <div className="postbox-header">
                <span>Quick Draft</span>
              </div>
              <div className="postbox-content">
                <form onSubmit={handleSaveDraft} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d2327] mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="Title"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d2327] mb-1">
                      What’s on your mind?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write your quick ideas here..."
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingDraft}
                    className="button-primary text-xs"
                  >
                    {savingDraft ? 'Saving Draft...' : 'Save Draft'}
                  </button>
                </form>
              </div>
            </div>

            {/* Widget: Recent Comments */}
            <div className="postbox">
              <div className="postbox-header flex justify-between items-center">
                <span>Recent Comments</span>
                <Link href="/wp-admin/comments" className="text-xs text-[#2271b1] hover:underline">
                  View all
                </Link>
              </div>
              <div className="postbox-content">
                <div className="divide-y divide-[#f0f0f1]">
                  {data?.recentComments?.map((comment: any) => (
                    <div key={comment.id} className="py-3 flex gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-[#2271b1] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {comment.authorName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="text-[#646970]">
                          <strong className="text-[#1d2327]">{comment.authorName}</strong> on{' '}
                          <Link
                            href={`/wp-admin/posts/${comment.postId}`}
                            className="text-[#2271b1] hover:underline font-medium"
                          >
                            {comment.post?.title || 'Post'}
                          </Link>
                        </div>
                        <p className="mt-1 text-[#2c3338] italic bg-[#f6f7f7] p-2 rounded border border-[#e5e5e5]">
                          {comment.content}
                        </p>

                        {/* Inline Actions */}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#2271b1]">
                          <button
                            onClick={() =>
                              handleModerateComment(
                                comment.id,
                                comment.status === 'APPROVED' ? 'PENDING' : 'APPROVED'
                              )
                            }
                            className="hover:underline flex items-center gap-0.5"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.status === 'APPROVED' ? 'Unapprove' : 'Approve'}</span>
                          </button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button
                            onClick={() => handleModerateComment(comment.id, 'SPAM')}
                            className="text-[#dba617] hover:underline"
                          >
                            Spam
                          </button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button
                            onClick={() => handleModerateComment(comment.id, 'TRASH')}
                            className="text-[#d63638] hover:underline"
                          >
                            Trash
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!data?.recentComments || data.recentComments.length === 0) && (
                    <div className="py-3 text-xs text-[#8c8f94]">No comments yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

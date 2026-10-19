'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  author: { displayName: string };
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  _count?: { comments: number };
}

export default function PostsPage() {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, trash: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [quickEditPost, setQuickEditPost] = useState<PostItem | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSlug, setQuickSlug] = useState('');
  const [quickStatus, setQuickStatus] = useState('DRAFT');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentTab !== 'ALL') q.set('status', currentTab);
      if (search) q.set('search', search);

      const res = await fetch(`/api/posts?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
        if (data.counts) setCounts(data.counts);
      } else {
        addToast(data.error || 'Failed to fetch posts', 'error');
      }
    } catch {
      addToast('Error loading posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleTrashOrDelete = async (id: string, force: boolean = false) => {
    if (force && !confirm('Permanently delete this post? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Post deleted', 'success');
        fetchPosts();
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch {
      addToast('Error deleting post', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      if (res.ok) {
        addToast('Post restored to Drafts.', 'success');
        fetchPosts();
      }
    } catch {
      addToast('Failed to restore post', 'error');
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'trash') {
      for (const id of selectedIds) {
        await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      }
      addToast(`Moved ${selectedIds.length} posts to Trash.`, 'success');
      setSelectedIds([]);
      fetchPosts();
    } else if (bulkAction === 'delete') {
      if (!confirm(`Permanently delete ${selectedIds.length} items?`)) return;
      for (const id of selectedIds) {
        await fetch(`/api/posts/${id}?force=true`, { method: 'DELETE' });
      }
      addToast(`Permanently deleted ${selectedIds.length} posts.`, 'success');
      setSelectedIds([]);
      fetchPosts();
    }
  };

  const openQuickEdit = (post: PostItem) => {
    setQuickEditPost(post);
    setQuickTitle(post.title);
    setQuickSlug(post.slug);
    setQuickStatus(post.status);
  };

  const saveQuickEdit = async () => {
    if (!quickEditPost) return;
    try {
      const res = await fetch(`/api/posts/${quickEditPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle,
          slug: quickSlug,
          status: quickStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Quick Edit saved successfully!', 'success');
        setQuickEditPost(null);
        fetchPosts();
      } else {
        addToast(data.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Error updating post', 'error');
    }
  };

  return (
    <AdminLayout title="Posts">
      <div className="space-y-4">
        {/* Top Header Row: Title & "Add New" Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Posts</h1>
            <Link
              href="/wp-admin/posts/new"
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </Link>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
            <input
              type="search"
              placeholder="Search Posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white text-[#2c3338] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338]"
            >
              Search Posts
            </button>
          </form>
        </div>

        {/* Status Filter Tabs (WordPress Style) */}
        <div className="flex items-center gap-2 text-xs text-[#646970] border-b border-[#dcdcde] pb-2">
          <button
            type="button"
            onClick={() => setCurrentTab('ALL')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'ALL' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            All <span className="text-[#8c8f94]">({counts.all})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('PUBLISHED')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'PUBLISHED' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Published <span className="text-[#8c8f94]">({counts.published})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('DRAFT')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'DRAFT' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Drafts <span className="text-[#8c8f94]">({counts.draft})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('TRASH')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'TRASH' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Trash <span className="text-[#8c8f94]">({counts.trash})</span>
          </button>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#2c3338]"
            >
              <option value="">Bulk actions</option>
              {currentTab === 'TRASH' ? (
                <option value="delete">Delete Permanently</option>
              ) : (
                <option value="trash">Move to Trash</option>
              )}
            </select>
            <button
              type="button"
              onClick={handleBulkApply}
              disabled={selectedIds.length === 0 || !bulkAction}
              className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338] disabled:opacity-50"
            >
              Apply
            </button>
            <span className="text-[#646970]">
              {selectedIds.length > 0 && `${selectedIds.length} item(s) selected`}
            </span>
          </div>

          <div className="text-[#646970]">
            <span>{posts.length} items</span>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={posts.length > 0 && selectedIds.length === posts.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#8c8f94] text-[#2271b1]"
                  />
                </th>
                <th className="p-2.5">Title</th>
                <th className="p-2.5 w-32">Author</th>
                <th className="p-2.5 w-40">Categories</th>
                <th className="p-2.5 w-36">Tags</th>
                <th className="p-2.5 w-16 text-center">
                  <MessageSquare className="w-3.5 h-3.5 mx-auto text-[#646970]" />
                </th>
                <th className="p-2.5 w-36">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcdcde]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#646970]">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#646970]">
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <React.Fragment key={post.id}>
                    <tr className="hover:bg-[#f6f7f7] group transition-colors">
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(post.id)}
                          onChange={() => handleSelectOne(post.id)}
                          className="rounded border-[#8c8f94] text-[#2271b1]"
                        />
                      </td>

                      <td className="p-2.5 py-3">
                        <div className="font-semibold text-sm text-[#1d2327]">
                          <Link
                            href={
                              post.status === 'TRASH'
                                ? '#'
                                : `/wp-admin/posts/${post.id}`
                            }
                            className="hover:text-[#2271b1]"
                          >
                            {post.title}
                          </Link>
                          {post.status === 'DRAFT' && (
                            <span className="ml-2 font-normal text-xs text-[#dba617]">
                              — Draft
                            </span>
                          )}
                          {post.status === 'TRASH' && (
                            <span className="ml-2 font-normal text-xs text-[#d63638]">
                              — Trash
                            </span>
                          )}
                        </div>

                        {/* Row Action Links (shown on hover or mobile) */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#646970]">
                          {post.status !== 'TRASH' ? (
                            <>
                              <Link
                                href={`/wp-admin/posts/${post.id}`}
                                className="text-[#2271b1] hover:underline"
                              >
                                Edit
                              </Link>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => openQuickEdit(post)}
                                className="text-[#2271b1] hover:underline"
                              >
                                Quick Edit
                              </button>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => handleTrashOrDelete(post.id, false)}
                                className="text-[#b32d2e] hover:underline"
                              >
                                Trash
                              </button>
                              <span>|</span>
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#2271b1] hover:underline"
                              >
                                View
                              </a>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(post.id)}
                                className="text-[#2271b1] hover:underline"
                              >
                                Restore
                              </button>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => handleTrashOrDelete(post.id, true)}
                                className="text-[#b32d2e] hover:underline font-semibold"
                              >
                                Delete Permanently
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 text-[#2c3338]">
                        {post.author?.displayName || 'Admin'}
                      </td>

                      <td className="p-2.5 text-[#2c3338]">
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.map((c) => c.name).join(', ')
                        ) : (
                          <span className="text-[#8c8f94]">—</span>
                        )}
                      </td>

                      <td className="p-2.5 text-[#2c3338]">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map((t) => t.name).join(', ')
                        ) : (
                          <span className="text-[#8c8f94]">—</span>
                        )}
                      </td>

                      <td className="p-2.5 text-center text-[#2c3338]">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#f0f0f1] font-semibold text-[11px]">
                          {post._count?.comments || 0}
                        </span>
                      </td>

                      <td className="p-2.5 text-[#50575e]">
                        <div>
                          {post.status === 'PUBLISHED' ? 'Published' : 'Last Modified'}
                        </div>
                        <div className="text-[11px] text-[#646970]">
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Quick Edit Row */}
                    {quickEditPost?.id === post.id && (
                      <tr className="bg-[#f0f0f1] border-y-2 border-[#2271b1]">
                        <td colSpan={7} className="p-4">
                          <div className="font-semibold text-xs text-[#1d2327] mb-3 uppercase tracking-wider">
                            QUICK EDIT
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <label className="block font-medium mb-1">Title</label>
                              <input
                                type="text"
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-medium mb-1">Slug</label>
                              <input
                                type="text"
                                value={quickSlug}
                                onChange={(e) => setQuickSlug(e.target.value)}
                                className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-medium mb-1">Status</label>
                              <select
                                value={quickStatus}
                                onChange={(e) => setQuickStatus(e.target.value)}
                                className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                              >
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="PENDING">Pending Review</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#dcdcde]">
                            <button
                              type="button"
                              onClick={() => setQuickEditPost(null)}
                              className="px-3 py-1 bg-white border border-[#c3c4c7] hover:bg-[#f6f7f7] text-[#2c3338] rounded font-medium text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveQuickEdit}
                              className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Trash2,
  Reply,
  Edit2,
  ExternalLink,
} from 'lucide-react';

interface CommentItem {
  id: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string | null;
  content: string;
  status: string; // APPROVED, PENDING, SPAM, TRASH
  createdAt: string;
  postId: string;
  post: { id: string; title: string; slug: string };
  user?: { displayName: string; avatarUrl?: string | null } | null;
}

export default function CommentsPage() {
  const { addToast } = useToast();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    spam: 0,
    trash: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Inline Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Inline Quick Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentTab !== 'ALL') q.set('status', currentTab);
      if (search) q.set('search', search);

      const res = await fetch(`/api/comments?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch {
      addToast('Error loading comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentTab]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast(`Comment marked as ${newStatus.toLowerCase()}.`, 'success');
        fetchComments();
      }
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string, force: boolean = false) => {
    if (force && !confirm('Permanently delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addToast(force ? 'Comment deleted.' : 'Moved to Trash.', 'success');
        fetchComments();
      }
    } catch {
      addToast('Failed to delete comment', 'error');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(comments.map((c) => c.id));
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

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    for (const id of selectedIds) {
      if (bulkAction === 'approve') {
        await fetch(`/api/comments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'APPROVED' }),
        });
      } else if (bulkAction === 'unapprove') {
        await fetch(`/api/comments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PENDING' }),
        });
      } else if (bulkAction === 'spam') {
        await fetch(`/api/comments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SPAM' }),
        });
      } else if (bulkAction === 'trash') {
        await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      } else if (bulkAction === 'delete') {
        await fetch(`/api/comments/${id}?force=true`, { method: 'DELETE' });
      }
    }

    addToast(`Bulk action applied to ${selectedIds.length} comments.`, 'success');
    setSelectedIds([]);
    fetchComments();
  };

  const handleSendReply = async (comment: CommentItem) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: comment.postId,
          parentId: comment.id,
          content: replyContent.trim(),
        }),
      });
      if (res.ok) {
        addToast('Reply posted!', 'success');
        setReplyingToId(null);
        setReplyContent('');
        fetchComments();
      } else {
        addToast('Failed to post reply', 'error');
      }
    } catch {
      addToast('Error posting reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSaveQuickEdit = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        addToast('Comment updated.', 'success');
        setEditingId(null);
        fetchComments();
      }
    } catch {
      addToast('Failed to update comment', 'error');
    }
  };

  return (
    <AdminLayout title="Comments">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Comments</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchComments();
            }}
            className="flex items-center gap-1"
          >
            <input
              type="search"
              placeholder="Search Comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white text-[#2c3338] outline-none focus:border-[#2271b1]"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338]"
            >
              Search
            </button>
          </form>
        </div>

        {/* Status Filter Tabs */}
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
            onClick={() => setCurrentTab('PENDING')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'PENDING' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Pending <span className="text-[#8c8f94]">({counts.pending})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('APPROVED')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'APPROVED' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Approved <span className="text-[#8c8f94]">({counts.approved})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('SPAM')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'SPAM' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Spam <span className="text-[#8c8f94]">({counts.spam})</span>
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
              <option value="approve">Approve</option>
              <option value="unapprove">Unapprove</option>
              <option value="spam">Mark as Spam</option>
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
          </div>

          <div className="text-[#646970]">
            <span>{comments.length} comments</span>
          </div>
        </div>

        {/* Comments Table */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={comments.length > 0 && selectedIds.length === comments.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#8c8f94] text-[#2271b1]"
                  />
                </th>
                <th className="p-2.5 w-48">Author</th>
                <th className="p-2.5">Comment</th>
                <th className="p-2.5 w-48">In Response To</th>
                <th className="p-2.5 w-36">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcdcde]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#646970]">
                    Loading comments...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#646970]">
                    No comments found.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <tr
                      className={`hover:bg-[#f6f7f7] group transition-colors ${
                        comment.status === 'PENDING'
                          ? 'bg-[#fcf9e8]'
                          : comment.status === 'SPAM'
                          ? 'bg-red-50/50'
                          : ''
                      }`}
                    >
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(comment.id)}
                          onChange={() => handleSelectOne(comment.id)}
                          className="rounded border-[#8c8f94] text-[#2271b1]"
                        />
                      </td>

                      {/* Author Cell */}
                      <td className="p-2.5 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-[#2271b1] text-white flex items-center justify-center font-bold text-xs uppercase">
                            {comment.authorName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1d2327]">
                              {comment.authorName}
                            </div>
                            <div className="text-[11px] text-[#646970]">
                              {comment.authorEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Comment Body & Row Actions */}
                      <td className="p-2.5 align-top">
                        {editingId === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border border-[#8c8f94] rounded text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveQuickEdit(comment.id)}
                                className="px-3 py-1 bg-[#2271b1] text-white rounded font-semibold text-xs"
                              >
                                Update Comment
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-white border border-[#c3c4c7] rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-[#2c3338] leading-relaxed mb-2">
                              {comment.content}
                            </div>

                            {/* Row Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#646970]">
                              {comment.status !== 'TRASH' ? (
                                <>
                                  {comment.status === 'PENDING' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(comment.id, 'APPROVED')}
                                      className="text-[#00a32a] font-medium hover:underline"
                                    >
                                      Approve
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(comment.id, 'PENDING')}
                                      className="text-[#dba617] font-medium hover:underline"
                                    >
                                      Unapprove
                                    </button>
                                  )}
                                  <span>|</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToId(
                                        replyingToId === comment.id ? null : comment.id
                                      );
                                      setReplyContent('');
                                    }}
                                    className="text-[#2271b1] hover:underline"
                                  >
                                    Reply
                                  </button>
                                  <span>|</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(comment.id);
                                      setEditContent(comment.content);
                                    }}
                                    className="text-[#2271b1] hover:underline"
                                  >
                                    Quick Edit
                                  </button>
                                  <span>|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(comment.id, 'SPAM')}
                                    className="text-[#b32d2e] hover:underline"
                                  >
                                    Spam
                                  </button>
                                  <span>|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(comment.id, false)}
                                    className="text-[#b32d2e] hover:underline"
                                  >
                                    Trash
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(comment.id, 'APPROVED')}
                                    className="text-[#2271b1] hover:underline"
                                  >
                                    Restore
                                  </button>
                                  <span>|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(comment.id, true)}
                                    className="text-[#b32d2e] font-semibold hover:underline"
                                  >
                                    Delete Permanently
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </td>

                      {/* In Response To */}
                      <td className="p-2.5 align-top">
                        <div className="font-semibold text-[#1d2327]">
                          <Link
                            href={`/wp-admin/posts/${comment.postId}`}
                            className="hover:text-[#2271b1]"
                          >
                            {comment.post?.title || 'Unknown Post'}
                          </Link>
                        </div>
                        <a
                          href={`/blog/${comment.post?.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#2271b1] hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          View Post <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      {/* Submitted On */}
                      <td className="p-2.5 align-top text-[#50575e]">
                        <div>{formatDate(comment.createdAt)}</div>
                        <div className="text-[11px] text-[#646970]">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Reply Form */}
                    {replyingToId === comment.id && (
                      <tr className="bg-[#f0f0f1] border-y border-[#c3c4c7]">
                        <td colSpan={5} className="p-4">
                          <div className="max-w-2xl space-y-2">
                            <span className="text-xs font-semibold text-[#1d2327]">
                              Reply to {comment.authorName}:
                            </span>
                            <textarea
                              rows={3}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full p-2.5 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327] outline-none focus:border-[#2271b1]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={submittingReply}
                                onClick={() => handleSendReply(comment)}
                                className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs disabled:opacity-50"
                              >
                                {submittingReply ? 'Sending...' : 'Submit Reply'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1 bg-white border border-[#c3c4c7] hover:bg-[#f6f7f7] text-[#2c3338] rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
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

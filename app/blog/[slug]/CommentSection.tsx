'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string | Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments: any[];
}

export default function CommentSection({
  postId,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotice('Your comment has been submitted and is awaiting moderation.');
        setContent('');
        if (data.comment?.status === 'APPROVED') {
          setComments([data.comment, ...comments]);
        }
      } else {
        alert(data.error || 'Failed to submit comment');
      }
    } catch {
      alert('Error submitting comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#2271b1]" />
        Comments ({comments.length})
      </h3>

      {/* Existing Comments List */}
      {comments.length > 0 && (
        <div className="divide-y divide-gray-100 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="pt-4 first:pt-0 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{c.authorName}</span>
                <span className="text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submission Notice */}
      {notice && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Leave a Reply Form */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Leave a Reply</h4>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-[#2271b1]"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-[#2271b1]"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-[#2271b1]"
              placeholder="Write your thoughts..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded text-xs shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}

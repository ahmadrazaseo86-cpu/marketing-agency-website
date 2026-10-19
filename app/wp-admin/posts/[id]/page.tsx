'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PostEditorLayout from '@/components/editor/PostEditorLayout';
import { Plus } from 'lucide-react';

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/tags').then((r) => r.json()),
    ])
      .then(([postData, catData, tagData]) => {
        if (postData.post) {
          const p = postData.post;
          setPost({
            ...p,
            categoryIds: p.categories ? p.categories.map((c: any) => c.id) : [],
            tagIds: p.tags ? p.tags.map((t: any) => t.id) : [],
          });
        } else {
          setError(postData.error || 'Post not found');
        }
        setCategories(catData.categories || []);
        setTags(tagData.tags || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Error loading post');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminLayout title="Edit Post">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Edit Post</h1>
          <Link
            href="/wp-admin/posts/new"
            className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading post data...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            {error}
          </div>
        ) : (
          <PostEditorLayout
            type="post"
            initialData={post}
            categories={categories}
            tags={tags}
          />
        )}
      </div>
    </AdminLayout>
  );
}

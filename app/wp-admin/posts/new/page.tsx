'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PostEditorLayout from '@/components/editor/PostEditorLayout';

export default function NewPostPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/tags').then((r) => r.json()),
    ])
      .then(([catData, tagData]) => {
        setCategories(catData.categories || []);
        setTags(tagData.tags || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Add New Post">
      <div className="space-y-4">
        <h1 className="text-2xl font-normal text-[#1d2327]">Add New Post</h1>
        {loading ? (
          <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading editor...
          </div>
        ) : (
          <PostEditorLayout
            type="post"
            categories={categories}
            tags={tags}
          />
        )}
      </div>
    </AdminLayout>
  );
}

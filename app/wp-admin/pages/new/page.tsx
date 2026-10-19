'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PostEditorLayout from '@/components/editor/PostEditorLayout';

export default function NewPage() {
  const [pagesList, setPagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages')
      .then((r) => r.json())
      .then((data) => {
        setPagesList(data.pages || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Add New Page">
      <div className="space-y-4">
        <h1 className="text-2xl font-normal text-[#1d2327]">Add New Page</h1>
        {loading ? (
          <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading editor...
          </div>
        ) : (
          <PostEditorLayout
            type="page"
            pagesList={pagesList}
          />
        )}
      </div>
    </AdminLayout>
  );
}

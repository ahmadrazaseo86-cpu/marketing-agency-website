'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PostEditorLayout from '@/components/editor/PostEditorLayout';
import { Plus } from 'lucide-react';

export default function EditPage() {
  const params = useParams();
  const id = params?.id as string;

  const [page, setPage] = useState<any>(null);
  const [pagesList, setPagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/pages/${id}`).then((r) => r.json()),
      fetch('/api/pages').then((r) => r.json()),
    ])
      .then(([pageData, allPagesData]) => {
        if (pageData.page) {
          setPage(pageData.page);
        } else {
          setError(pageData.error || 'Page not found');
        }
        setPagesList(allPagesData.pages || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Error loading page');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminLayout title="Edit Page">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Edit Page</h1>
          <Link
            href="/wp-admin/pages/new"
            className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading page data...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            {error}
          </div>
        ) : (
          <PostEditorLayout
            type="page"
            initialData={page}
            pagesList={pagesList}
          />
        )}
      </div>
    </AdminLayout>
  );
}

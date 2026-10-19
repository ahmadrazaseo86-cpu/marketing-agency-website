'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  template: string;
  order: number;
  createdAt: string;
  author: { displayName: string };
  parent?: { title: string } | null;
}

export default function PagesListPage() {
  const { addToast } = useToast();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, trash: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [quickEditPage, setQuickEditPage] = useState<PageItem | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSlug, setQuickSlug] = useState('');
  const [quickStatus, setQuickStatus] = useState('DRAFT');
  const [quickTemplate, setQuickTemplate] = useState('default');
  const [quickOrder, setQuickOrder] = useState(0);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentTab !== 'ALL') q.set('status', currentTab);
      if (search) q.set('search', search);

      const res = await fetch(`/api/pages?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPages(data.pages || []);
        if (data.counts) setCounts(data.counts);
      } else {
        addToast(data.error || 'Failed to fetch pages', 'error');
      }
    } catch {
      addToast('Error loading pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [currentTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(pages.map((p) => p.id));
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
    if (force && !confirm('Permanently delete this page? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/pages/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Page deleted', 'success');
        fetchPages();
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        addToast(data.error || 'Failed to delete page', 'error');
      }
    } catch {
      addToast('Error deleting page', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      if (res.ok) {
        addToast('Page restored to Drafts.', 'success');
        fetchPages();
      }
    } catch {
      addToast('Failed to restore page', 'error');
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'trash') {
      for (const id of selectedIds) {
        await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      }
      addToast(`Moved ${selectedIds.length} pages to Trash.`, 'success');
      setSelectedIds([]);
      fetchPages();
    } else if (bulkAction === 'delete') {
      if (!confirm(`Permanently delete ${selectedIds.length} items?`)) return;
      for (const id of selectedIds) {
        await fetch(`/api/pages/${id}?force=true`, { method: 'DELETE' });
      }
      addToast(`Permanently deleted ${selectedIds.length} pages.`, 'success');
      setSelectedIds([]);
      fetchPages();
    }
  };

  const openQuickEdit = (page: PageItem) => {
    setQuickEditPage(page);
    setQuickTitle(page.title);
    setQuickSlug(page.slug);
    setQuickStatus(page.status);
    setQuickTemplate(page.template);
    setQuickOrder(page.order);
  };

  const saveQuickEdit = async () => {
    if (!quickEditPage) return;
    try {
      const res = await fetch(`/api/pages/${quickEditPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle,
          slug: quickSlug,
          status: quickStatus,
          template: quickTemplate,
          order: quickOrder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Quick Edit saved successfully!', 'success');
        setQuickEditPage(null);
        fetchPages();
      } else {
        addToast(data.error || 'Failed to update page', 'error');
      }
    } catch {
      addToast('Error updating page', 'error');
    }
  };

  return (
    <AdminLayout title="Pages">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Pages</h1>
            <Link
              href="/wp-admin/pages/new"
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
            <input
              type="search"
              placeholder="Search Pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white text-[#2c3338] outline-none focus:border-[#2271b1]"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338]"
            >
              Search Pages
            </button>
          </form>
        </div>

        {/* Status Filters */}
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
          </div>

          <div className="text-[#646970]">
            <span>{pages.length} items</span>
          </div>
        </div>

        {/* Pages Table */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={pages.length > 0 && selectedIds.length === pages.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#8c8f94] text-[#2271b1]"
                  />
                </th>
                <th className="p-2.5">Title</th>
                <th className="p-2.5 w-32">Author</th>
                <th className="p-2.5 w-32">Template</th>
                <th className="p-2.5 w-20 text-center">Order</th>
                <th className="p-2.5 w-36">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcdcde]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#646970]">
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#646970]">
                    No pages found.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-[#f6f7f7] group transition-colors">
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded border-[#8c8f94] text-[#2271b1]"
                        />
                      </td>

                      <td className="p-2.5 py-3">
                        <div className="font-semibold text-sm text-[#1d2327]">
                          {p.parent && (
                            <span className="text-[#8c8f94] font-normal mr-1">
                              — {p.parent.title} &gt;
                            </span>
                          )}
                          <Link
                            href={
                              p.status === 'TRASH'
                                ? '#'
                                : `/wp-admin/pages/${p.id}`
                            }
                            className="hover:text-[#2271b1]"
                          >
                            {p.title}
                          </Link>
                          {p.status === 'DRAFT' && (
                            <span className="ml-2 font-normal text-xs text-[#dba617]">
                              — Draft
                            </span>
                          )}
                          {p.status === 'TRASH' && (
                            <span className="ml-2 font-normal text-xs text-[#d63638]">
                              — Trash
                            </span>
                          )}
                        </div>

                        {/* Row Actions */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#646970]">
                          {p.status !== 'TRASH' ? (
                            <>
                              <Link
                                href={`/wp-admin/pages/${p.id}`}
                                className="text-[#2271b1] hover:underline"
                              >
                                Edit
                              </Link>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => openQuickEdit(p)}
                                className="text-[#2271b1] hover:underline"
                              >
                                Quick Edit
                              </button>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => handleTrashOrDelete(p.id, false)}
                                className="text-[#b32d2e] hover:underline"
                              >
                                Trash
                              </button>
                              <span>|</span>
                              <a
                                href={`/page/${p.slug}`}
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
                                onClick={() => handleRestore(p.id)}
                                className="text-[#2271b1] hover:underline"
                              >
                                Restore
                              </button>
                              <span>|</span>
                              <button
                                type="button"
                                onClick={() => handleTrashOrDelete(p.id, true)}
                                className="text-[#b32d2e] hover:underline font-semibold"
                              >
                                Delete Permanently
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 text-[#2c3338]">
                        {p.author?.displayName || 'Admin'}
                      </td>

                      <td className="p-2.5 text-[#50575e] capitalize">
                        {p.template}
                      </td>

                      <td className="p-2.5 text-center text-[#50575e]">
                        {p.order}
                      </td>

                      <td className="p-2.5 text-[#50575e]">
                        <div>{p.status === 'PUBLISHED' ? 'Published' : 'Last Modified'}</div>
                        <div className="text-[11px] text-[#646970]">
                          {formatDate(p.createdAt)}
                        </div>
                      </td>
                    </tr>

                    {/* Quick Edit Page */}
                    {quickEditPage?.id === p.id && (
                      <tr className="bg-[#f0f0f1] border-y-2 border-[#2271b1]">
                        <td colSpan={6} className="p-4">
                          <div className="font-semibold text-xs text-[#1d2327] mb-3 uppercase tracking-wider">
                            QUICK EDIT PAGE
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
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
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium mb-1">Template</label>
                              <select
                                value={quickTemplate}
                                onChange={(e) => setQuickTemplate(e.target.value)}
                                className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                              >
                                <option value="default">Default Template</option>
                                <option value="full-width">Full Width</option>
                                <option value="landing">Landing</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#dcdcde]">
                            <button
                              type="button"
                              onClick={() => setQuickEditPage(null)}
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

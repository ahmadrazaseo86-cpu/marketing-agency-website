'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { slugify } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
}

export default function TagsPage() {
  const { addToast } = useToast();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (res.ok) {
        setTags(data.tags || []);
      }
    } catch {
      addToast('Error loading tags', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Tag name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`Tag "${data.tag.name}" created!`, 'success');
        setName('');
        setSlug('');
        setDescription('');
        fetchTags();
      } else {
        addToast(data.error || 'Failed to create tag', 'error');
      }
    } catch {
      addToast('Error creating tag', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string, tagName: string) => {
    if (!confirm(`Delete tag "${tagName}"?`)) return;
    try {
      const res = await fetch(`/api/tags?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Tag "${tagName}" deleted.`, 'success');
        fetchTags();
      } else {
        addToast(data.error || 'Failed to delete tag', 'error');
      }
    } catch {
      addToast('Error deleting tag', 'error');
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Tags">
      <div className="space-y-4">
        <h1 className="text-2xl font-normal text-[#1d2327]">Tags</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Add New Tag Form */}
          <div className="md:col-span-5 bg-white p-5 border border-[#c3c4c7] rounded shadow-sm">
            <h2 className="text-base font-semibold text-[#1d2327] mb-3">
              Add New Tag
            </h2>
            <form onSubmit={handleCreateTag} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                  placeholder="e.g. SEO Tips"
                />
                <p className="text-[11px] text-[#646970] mt-1">
                  The name is how it appears on your site.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                  placeholder="e.g. seo-tips"
                />
                <p className="text-[11px] text-[#646970] mt-1">
                  The &quot;slug&quot; is the URL-friendly version of the name.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                  placeholder="Optional description..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded text-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {submitting ? 'Adding...' : 'Add New Tag'}
              </button>
            </form>
          </div>

          {/* Right Column: Tags Table */}
          <div className="md:col-span-7 space-y-3">
            {/* Search Box */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-[#646970]">
                {filteredTags.length} tags
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="search"
                  placeholder="Search Tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white outline-none focus:border-[#2271b1]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Slug</th>
                    <th className="p-2.5 text-center w-16">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#646970]">
                        Loading tags...
                      </td>
                    </tr>
                  ) : filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#646970]">
                        No tags found.
                      </td>
                    </tr>
                  ) : (
                    filteredTags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-[#f6f7f7] group">
                        <td className="p-2.5">
                          <div className="font-semibold text-sm text-[#1d2327]">
                            {tag.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#646970]">
                            <button
                              type="button"
                              onClick={() => handleDeleteTag(tag.id, tag.name)}
                              className="text-[#b32d2e] hover:underline"
                            >
                              Delete
                            </button>
                            <span>|</span>
                            <span className="text-[#646970]">ID: {tag.id.slice(-6)}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-[#50575e]">
                          {tag.description || '—'}
                        </td>
                        <td className="p-2.5 text-[#50575e] font-mono text-[11px]">
                          {tag.slug}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-[#2271b1]">
                          {tag._count?.posts || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

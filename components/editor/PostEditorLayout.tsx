'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Trash2,
  Calendar,
  Lock,
  Globe,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
  History,
  Search,
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useToast } from '@/components/ui/Toast';
import { slugify } from '@/lib/utils';

export interface PostEditorData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string; // DRAFT, PUBLISHED, SCHEDULED, TRASH
  visibility?: string; // PUBLIC, PRIVATE, PASSWORD
  password?: string;
  scheduledAt?: string | null;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  authorId?: string;
  // Page specific
  parentId?: string | null;
  template?: string;
  order?: number;
  revisions?: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

interface PostEditorProps {
  type: 'post' | 'page';
  initialData?: PostEditorData;
  categories?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
  pagesList?: Array<{ id: string; title: string }>;
  authorsList?: Array<{ id: string; displayName: string }>;
  onSaveSuccess?: (savedData: any) => void;
}

export default function PostEditorLayout({
  type,
  initialData,
  categories = [],
  tags = [],
  pagesList = [],
  authorsList = [],
  onSaveSuccess,
}: PostEditorProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [visibility, setVisibility] = useState(initialData?.visibility || 'PUBLIC');
  const [password, setPassword] = useState(initialData?.password || '');
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(initialData?.focusKeyword || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categoryIds || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tagIds || []);
  const [tagInput, setTagInput] = useState('');
  const [allCategories, setAllCategories] = useState(categories);
  const [allTags, setAllTags] = useState(tags);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCatForm, setShowNewCatForm] = useState(false);

  // Page Specific State
  const [parentId, setParentId] = useState(initialData?.parentId || '');
  const [template, setTemplate] = useState(initialData?.template || 'default');
  const [order, setOrder] = useState(initialData?.order || 0);

  // UI state
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisions, setRevisions] = useState(initialData?.revisions || []);

  // Collapsible accordion boxes in right sidebar
  const [openBoxes, setOpenBoxes] = useState<Record<string, boolean>>({
    publish: true,
    pageAttributes: true,
    categories: true,
    tags: true,
    featuredImage: true,
    excerpt: false,
    author: false,
    seo: true,
  });

  const toggleBox = (box: string) => {
    setOpenBoxes((prev) => ({ ...prev, [box]: !prev[box] }));
  };

  // Auto-generate slug on title change if not manually edited or new
  useEffect(() => {
    if (!initialData?.id && !isEditingSlug && !tempSlug) {
      const generated = slugify(title);
      setSlug(generated);
      setTempSlug(generated);
    }
  }, [title, isEditingSlug, tempSlug, initialData?.id]);

  // Handle Tag addition
  const handleAddTag = (tagName: string) => {
    const clean = tagName.trim();
    if (!clean) return;
    const existing = allTags.find((t) => t.name.toLowerCase() === clean.toLowerCase());
    if (existing) {
      if (!selectedTags.includes(existing.id)) {
        setSelectedTags([...selectedTags, existing.id]);
      }
    } else {
      // Create new tag via API
      fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.tag) {
            setAllTags((prev) => [...prev, data.tag]);
            setSelectedTags((prev) => [...prev, data.tag.id]);
          }
        })
        .catch(() => {});
    }
    setTagInput('');
  };

  // Handle Category addition
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.category) {
        setAllCategories((prev) => [...prev, data.category]);
        setSelectedCategories((prev) => [...prev, data.category.id]);
        setNewCatName('');
        setShowNewCatForm(false);
        addToast(`Category "${data.category.name}" created!`, 'success');
      } else {
        addToast(data.error || 'Failed to add category', 'error');
      }
    } catch {
      addToast('Error adding category', 'error');
    }
  };

  // Handle Save (Draft, Publish, Schedule, Update)
  const handleSave = async (overrideStatus?: string) => {
    if (!title.trim()) {
      addToast('Please enter a title.', 'warning');
      return;
    }

    setSaving(true);
    const targetStatus = overrideStatus || status;

    const payload: any = {
      title,
      slug: slug || slugify(title),
      content,
      excerpt,
      status: targetStatus,
      visibility,
      password: visibility === 'PASSWORD' ? password : null,
      scheduledAt: targetStatus === 'SCHEDULED' ? scheduledAt : null,
      featuredImage,
      metaTitle,
      metaDescription,
      focusKeyword,
    };

    if (type === 'post') {
      payload.categoryIds = selectedCategories;
      payload.tagIds = selectedTags;
    } else {
      payload.parentId = parentId || null;
      payload.template = template;
      payload.order = parseInt(order.toString(), 10) || 0;
    }

    try {
      const isNew = !initialData?.id;
      const url = isNew
        ? type === 'post'
          ? '/api/posts'
          : '/api/pages'
        : type === 'post'
        ? `/api/posts/${initialData.id}`
        : `/api/pages/${initialData.id}`;

      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      const item = data.post || data.page;
      setStatus(item.status);
      setLastSavedTime(new Date().toLocaleTimeString());
      addToast(
        `${type === 'post' ? 'Post' : 'Page'} ${
          item.status === 'PUBLISHED' ? 'published' : 'saved'
        } successfully!`,
        'success'
      );

      if (onSaveSuccess) {
        onSaveSuccess(item);
      } else if (isNew) {
        router.push(`/wp-admin/${type === 'post' ? 'posts' : 'pages'}/${item.id}`);
      }
    } catch (err: any) {
      addToast(err.message || 'Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Trash Handler
  const handleMoveToTrash = async () => {
    if (!initialData?.id) {
      router.push(`/wp-admin/${type === 'post' ? 'posts' : 'pages'}`);
      return;
    }
    if (!confirm('Are you sure you want to move this to Trash?')) return;

    try {
      const url =
        type === 'post'
          ? `/api/posts/${initialData.id}`
          : `/api/pages/${initialData.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        addToast('Moved to Trash.', 'info');
        router.push(`/wp-admin/${type === 'post' ? 'posts' : 'pages'}`);
      }
    } catch {
      addToast('Failed to move to trash.', 'error');
    }
  };

  // SEO Snippet Preview calculation
  const previewTitle = metaTitle || title || 'Post Title Preview';
  const previewDesc =
    metaDescription ||
    (excerpt ? excerpt.slice(0, 150) : 'Please provide a meta description by editing the snippet below.');
  const previewSlug = slug || 'your-post-url';

  return (
    <div className="space-y-4">
      {/* Top action notices & save time indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#646970] pb-1">
        <div className="flex items-center gap-2">
          {lastSavedTime && (
            <span className="flex items-center gap-1 text-[#00a32a] font-medium">
              <Check className="w-3.5 h-3.5" /> Saved at {lastSavedTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {initialData?.revisions && initialData.revisions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRevisionModal(true)}
              className="text-[#2271b1] hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" /> {initialData.revisions.length} Revisions
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column WordPress Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Title, Permalink, Editor, SEO */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              className="w-full text-2xl font-semibold px-3 py-2.5 bg-white border border-[#c3c4c7] rounded focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none text-[#1d2327]"
            />
          </div>

          {/* Permalink Bar */}
          <div className="bg-[#f0f0f1] px-3 py-1.5 rounded border border-[#dcdcde] text-xs text-[#50575e] flex flex-wrap items-center gap-2">
            <span>
              <strong>Permalink:</strong> http://localhost:3000/{type === 'post' ? 'blog' : 'page'}/
            </span>
            {isEditingSlug ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={tempSlug}
                  onChange={(e) => setTempSlug(slugify(e.target.value))}
                  className="px-1.5 py-0.5 border border-[#8c8f94] rounded text-xs text-[#1d2327] bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlug(tempSlug);
                    setIsEditingSlug(false);
                  }}
                  className="px-2 py-0.5 bg-[#f6f7f7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1] hover:bg-[#e2e4e7]"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempSlug(slug);
                    setIsEditingSlug(false);
                  }}
                  className="text-[#646970] hover:underline ml-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="font-semibold text-[#1d2327]">{slug || '(auto-generated)'}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(true)}
                  className="px-2 py-0.5 bg-white border border-[#c3c4c7] rounded font-semibold text-[#2271b1] hover:bg-[#f6f7f7]"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <div>
            <RichTextEditor
              value={content}
              onChange={(val) => setContent(val)}
              placeholder="Write or paste your article content here..."
            />
          </div>

          {/* SEO & Snippet Meta Box */}
          <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
            <div
              onClick={() => toggleBox('seo')}
              className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="font-semibold text-sm text-[#1d2327] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#2271b1]" />
                Yoast / Search Engine Optimization (SEO)
              </h3>
              {openBoxes.seo ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
            </div>

            {openBoxes.seo && (
              <div className="p-4 space-y-4">
                {/* Focus Keyword */}
                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] mb-1">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={focusKeyword || ''}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. digital marketing lahore"
                    className="w-full px-3 py-1.5 border border-[#8c8f94] rounded text-xs text-[#2c3338] outline-none focus:border-[#2271b1]"
                  />
                </div>

                {/* Live Google Search Preview */}
                <div className="p-3 bg-[#f8f9fa] border border-[#e2e4e7] rounded">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#646970] block mb-2">
                    Google Snippet Preview
                  </span>
                  <div className="max-w-xl">
                    <div className="text-xs text-[#202124] truncate mb-0.5">
                      https://example.com › {type === 'post' ? 'blog' : 'page'} › {previewSlug}
                    </div>
                    <div className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer truncate">
                      {previewTitle}
                    </div>
                    <div className="text-xs text-[#4d5156] line-clamp-2 mt-1">
                      {previewDesc}
                    </div>
                  </div>
                </div>

                {/* Meta Title Input + Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#2c3338]">
                      SEO Title
                    </label>
                    <span className="text-[11px] text-[#646970]">
                      {metaTitle.length} / 60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Custom SEO Meta Title'}
                    className="w-full px-3 py-1.5 border border-[#8c8f94] rounded text-xs text-[#2c3338] outline-none focus:border-[#2271b1]"
                  />
                  <div className="w-full bg-[#f0f0f1] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        metaTitle.length >= 40 && metaTitle.length <= 60
                          ? 'bg-[#00a32a]'
                          : metaTitle.length > 60
                          ? 'bg-[#d63638]'
                          : 'bg-[#dba617]'
                      }`}
                      style={{ width: `${Math.min(100, (metaTitle.length / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta Description Input + Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#2c3338]">
                      Meta Description
                    </label>
                    <span className="text-[11px] text-[#646970]">
                      {metaDescription.length} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description that appears in Google search engine results..."
                    className="w-full px-3 py-1.5 border border-[#8c8f94] rounded text-xs text-[#2c3338] outline-none focus:border-[#2271b1]"
                  />
                  <div className="w-full bg-[#f0f0f1] h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        metaDescription.length >= 120 && metaDescription.length <= 160
                          ? 'bg-[#00a32a]'
                          : metaDescription.length > 160
                          ? 'bg-[#d63638]'
                          : 'bg-[#dba617]'
                      }`}
                      style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Publish, Attributes, Categories, Tags, Featured Image */}
        <div className="lg:col-span-4 space-y-4">
          {/* Publish Meta Box */}
          <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
            <div
              onClick={() => toggleBox('publish')}
              className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="font-semibold text-sm text-[#1d2327]">Publish</h3>
              {openBoxes.publish ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
            </div>

            {openBoxes.publish && (
              <div className="p-4 space-y-3 text-xs text-[#50575e]">
                {/* Actions: Save Draft & Preview */}
                <div className="flex items-center justify-between pb-3 border-b border-[#dcdcde]">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('DRAFT')}
                    className="px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2c3338] border border-[#c3c4c7] rounded font-medium disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2c3338] border border-[#c3c4c7] rounded font-medium flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#2271b1]" /> Preview
                  </button>
                </div>

                {/* Status selector */}
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#646970]" /> Status:
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#1d2327]"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PENDING">Pending Review</option>
                  </select>
                </div>

                {/* Visibility selector */}
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#646970]" /> Visibility:
                  </span>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#1d2327]"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PASSWORD">Password Protected</option>
                  </select>
                </div>

                {visibility === 'PASSWORD' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                )}

                {/* Publish Date / Schedule */}
                <div className="py-1">
                  <span className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#646970]" />
                    {status === 'SCHEDULED' ? 'Schedule for:' : 'Publish immediately'}
                  </span>
                  {status === 'SCHEDULED' && (
                    <input
                      type="datetime-local"
                      value={scheduledAt ? scheduledAt.slice(0, 16) : ''}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327]"
                    />
                  )}
                </div>

                {/* Bottom Bar: Move to trash & Primary Publish button */}
                <div className="flex items-center justify-between pt-3 border-t border-[#dcdcde]">
                  <button
                    type="button"
                    onClick={handleMoveToTrash}
                    className="text-[#b32d2e] hover:text-[#d63638] underline text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Move to Trash
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(status === 'DRAFT' ? 'PUBLISHED' : status)}
                    className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded shadow-sm disabled:opacity-50 text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : initialData?.id ? 'Update' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Page Hierarchy / Attributes (Only for Pages) */}
          {type === 'page' && (
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div
                onClick={() => toggleBox('pageAttributes')}
                className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="font-semibold text-sm text-[#1d2327]">Page Attributes</h3>
                {openBoxes.pageAttributes ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
              </div>

              {openBoxes.pageAttributes && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">
                      Parent Page
                    </label>
                    <select
                      value={parentId || ''}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs text-[#1d2327]"
                    >
                      <option value="">(no parent)</option>
                      {pagesList
                        .filter((p) => p.id !== initialData?.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">
                      Template
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#8c8f94] rounded bg-white text-xs text-[#1d2327]"
                    >
                      <option value="default">Default Template</option>
                      <option value="full-width">Full Width Page</option>
                      <option value="landing">Landing Page (No Header/Footer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Box (Only for Posts) */}
          {type === 'post' && (
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div
                onClick={() => toggleBox('categories')}
                className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="font-semibold text-sm text-[#1d2327]">Categories</h3>
                {openBoxes.categories ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
              </div>

              {openBoxes.categories && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="max-h-44 overflow-y-auto space-y-1.5 border border-[#dcdcde] p-2 rounded bg-[#fbfbfc]">
                    {allCategories.length === 0 ? (
                      <p className="text-[#646970] italic">No categories found.</p>
                    ) : (
                      allCategories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#2271b1]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, cat.id]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter((id) => id !== cat.id)
                                );
                              }
                            }}
                            className="rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Add New Category link & form */}
                  {!showNewCatForm ? (
                    <button
                      type="button"
                      onClick={() => setShowNewCatForm(true)}
                      className="text-[#2271b1] hover:underline font-medium text-xs block"
                    >
                      + Add New Category
                    </button>
                  ) : (
                    <form onSubmit={handleAddCategory} className="space-y-2 pt-2 border-t border-[#dcdcde]">
                      <input
                        type="text"
                        placeholder="New category name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded text-xs font-semibold text-[#2271b1]"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewCatForm(false)}
                          className="text-[#646970] hover:underline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tags Box (Only for Posts) */}
          {type === 'post' && (
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div
                onClick={() => toggleBox('tags')}
                className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="font-semibold text-sm text-[#1d2327]">Tags</h3>
                {openBoxes.tags ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
              </div>

              {openBoxes.tags && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1]"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-[11px] text-[#646970]">Separate tags with commas or Enter.</p>

                  {/* Selected Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTags.map((tagId) => {
                      const t = allTags.find((tag) => tag.id === tagId);
                      if (!t) return null;
                      return (
                        <span
                          key={tagId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f0f0f1] border border-[#c3c4c7] rounded-full text-xs text-[#2c3338]"
                        >
                          {t.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTags(selectedTags.filter((id) => id !== tagId))
                            }
                            className="hover:text-[#d63638] font-bold text-xs"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Featured Image Box */}
          <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
            <div
              onClick={() => toggleBox('featuredImage')}
              className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="font-semibold text-sm text-[#1d2327]">Featured Image</h3>
              {openBoxes.featuredImage ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
            </div>

            {openBoxes.featuredImage && (
              <div className="p-4 space-y-3 text-xs">
                {featuredImage ? (
                  <div className="space-y-2">
                    <img
                      src={featuredImage}
                      alt="Featured Preview"
                      className="w-full h-36 object-cover rounded border border-[#dcdcde]"
                    />
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter new image URL:', featuredImage);
                          if (url !== null) setFeaturedImage(url);
                        }}
                        className="text-[#2271b1] hover:underline"
                      >
                        Change image
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="text-[#d63638] hover:underline"
                      >
                        Remove featured image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt(
                          'Enter Featured Image URL (or Unsplash photo):',
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop'
                        );
                        if (url) setFeaturedImage(url);
                      }}
                      className="w-full py-6 border-2 border-dashed border-[#c3c4c7] rounded hover:border-[#2271b1] flex flex-col items-center justify-center text-[#2271b1] font-semibold text-xs gap-1.5 bg-[#fbfbfc]"
                    >
                      <ImageIcon className="w-6 h-6 text-[#646970]" />
                      Set featured image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Excerpt Box */}
          <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
            <div
              onClick={() => toggleBox('excerpt')}
              className="px-4 py-2.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="font-semibold text-sm text-[#1d2327]">Excerpt</h3>
              {openBoxes.excerpt ? <ChevronUp className="w-4 h-4 text-[#646970]" /> : <ChevronDown className="w-4 h-4 text-[#646970]" />}
            </div>

            {openBoxes.excerpt && (
              <div className="p-4 space-y-2 text-xs">
                <textarea
                  rows={3}
                  value={excerpt || ''}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write an optional excerpt (short summary for search engines and archives)..."
                  className="w-full px-2 py-1.5 border border-[#8c8f94] rounded text-xs bg-white text-[#1d2327] outline-none focus:border-[#2271b1]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#1d2327] text-white flex justify-between items-center">
              <span className="font-semibold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2271b1]" /> Preview: {title || 'Untitled'}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt={title}
                  className="w-full max-h-72 object-cover rounded-md"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{title || 'Untitled'}</h1>
              <div className="text-xs text-gray-500 pb-3 border-b">
                Status: {status} | Slug: /{slug}
              </div>
              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: content || '<p><i>No content provided.</i></p>' }}
              />
            </div>
            <div className="px-4 py-3 bg-gray-100 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#1d2327] text-white flex justify-between items-center">
              <span className="font-semibold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-[#2271b1]" /> Revisions for: {title}
              </span>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto divide-y divide-gray-200">
              {revisions.map((rev) => (
                <div key={rev.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-xs text-[#1d2327]">{rev.title}</div>
                    <div className="text-[11px] text-[#646970]">
                      Saved on {new Date(rev.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Restore this revision? Current unsaved work will be overwritten.')) {
                        setTitle(rev.title);
                        setContent(rev.content);
                        setShowRevisionModal(false);
                        addToast('Revision restored!', 'info');
                      }
                    }}
                    className="px-3 py-1 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#135e96]"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

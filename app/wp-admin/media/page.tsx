'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  UploadCloud,
  LayoutGrid,
  List as ListIcon,
  Search,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  createdAt: string;
  uploadedBy?: { displayName: string } | null;
}

export default function MediaLibraryPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Selected item modal
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  // External URL input
  const [externalUrl, setExternalUrl] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (typeFilter !== 'all') q.set('type', typeFilter);

      const res = await fetch(`/api/media?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMediaList(data.media || []);
      } else {
        addToast(data.error || 'Failed to load media', 'error');
      }
    } catch {
      addToast('Error loading media library', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Uploaded "${file.name}" successfully!`, 'success');
        fetchMedia();
      } else {
        addToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      addToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleExternalUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('url', externalUrl.trim());

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Media link added to library!', 'success');
        setExternalUrl('');
        setShowUploader(false);
        fetchMedia();
      } else {
        addToast(data.error || 'Failed to add link', 'error');
      }
    } catch {
      addToast('Error adding media URL', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const openDetailsModal = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditTitle(item.title || '');
    setEditAltText(item.altText || '');
    setEditCaption(item.caption || '');
  };

  const saveDetails = async () => {
    if (!selectedMedia) return;
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          altText: editAltText,
          caption: editCaption,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Attachment details saved.', 'success');
        setMediaList((prev) =>
          prev.map((m) => (m.id === selectedMedia.id ? data.media : m))
        );
        setSelectedMedia(data.media);
      } else {
        addToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      addToast('Error saving details', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this attachment?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Attachment deleted.', 'success');
        setSelectedMedia(null);
        fetchMedia();
      } else {
        addToast('Failed to delete media', 'error');
      }
    } catch {
      addToast('Error deleting media', 'error');
    }
  };

  const copyUrlToClipboard = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    addToast('URL copied to clipboard!', 'info');
  };

  return (
    <AdminLayout title="Media Library">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Media Library</h1>
            <button
              type="button"
              onClick={() => setShowUploader(!showUploader)}
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Media
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
            <input
              type="search"
              placeholder="Search media..."
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

        {/* Expandable Upload Area */}
        {showUploader && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-8 rounded text-center transition-colors bg-white ${
              isDragging
                ? 'border-[#2271b1] bg-blue-50/50'
                : 'border-[#c3c4c7] hover:border-[#8c8f94]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  uploadFile(e.target.files[0]);
                }
              }}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
            />
            <UploadCloud className="w-12 h-12 mx-auto text-[#2271b1] mb-2" />
            <h3 className="text-sm font-semibold text-[#1d2327]">
              Drop files anywhere to upload
            </h3>
            <p className="text-xs text-[#646970] mt-1 mb-4">or</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm"
            >
              {uploading ? 'Uploading...' : 'Select Files'}
            </button>

            {/* Quick URL Adder */}
            <div className="mt-6 pt-4 border-t border-[#dcdcde] max-w-md mx-auto">
              <span className="text-xs text-[#646970] block mb-2">
                Or add via direct Image URL / Unsplash link:
              </span>
              <form onSubmit={handleExternalUrlSubmit} className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white text-[#2c3338] outline-none"
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded text-xs font-semibold text-[#2271b1]"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Filter & View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs text-[#646970]">
          <div className="flex items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center border border-[#8c8f94] rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-[#2271b1] text-white'
                    : 'bg-white text-[#2c3338] hover:bg-[#f6f7f7]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 border-l border-[#8c8f94] ${
                  viewMode === 'list'
                    ? 'bg-[#2271b1] text-white'
                    : 'bg-white text-[#2c3338] hover:bg-[#f6f7f7]'
                }`}
                title="List view"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Media Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#2c3338]"
            >
              <option value="all">All media items</option>
              <option value="image">Images</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="application">Documents</option>
            </select>
          </div>

          <div>
            <span>{mediaList.length} items</span>
          </div>
        </div>

        {/* Media Content: Grid View or List View */}
        {loading ? (
          <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading media library...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7] space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-[#8c8f94]" />
            <p className="font-semibold text-sm text-[#1d2327]">No media items found.</p>
            <p className="text-xs">Drag and drop images above or click &quot;Add New Media&quot;.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mediaList.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetailsModal(item)}
                className="group relative aspect-square bg-[#f0f0f1] border border-[#c3c4c7] hover:border-[#2271b1] rounded cursor-pointer overflow-hidden shadow-sm flex items-center justify-center transition-all"
              >
                {item.mimeType.startsWith('image') ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#646970] p-2 text-center">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-[10px] truncate max-w-[80px]">
                      {item.filename}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white text-[11px] font-medium truncate">
                  {item.title || item.filename}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                  <th className="p-2.5 w-16">Preview</th>
                  <th className="p-2.5">File</th>
                  <th className="p-2.5 w-32">Author</th>
                  <th className="p-2.5 w-24">Size</th>
                  <th className="p-2.5 w-36">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dcdcde]">
                {mediaList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openDetailsModal(item)}
                    className="hover:bg-[#f6f7f7] cursor-pointer"
                  >
                    <td className="p-2">
                      <div className="w-12 h-12 bg-[#f0f0f1] rounded overflow-hidden flex items-center justify-center border">
                        {item.mimeType.startsWith('image') ? (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-[#646970]" />
                        )}
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-semibold text-sm text-[#1d2327]">
                        {item.title || item.filename}
                      </div>
                      <div className="text-[11px] text-[#646970] font-mono">
                        {item.filename}
                      </div>
                    </td>
                    <td className="p-2.5 text-[#50575e]">
                      {item.uploadedBy?.displayName || 'Admin'}
                    </td>
                    <td className="p-2.5 text-[#50575e]">
                      {Math.round(item.size / 1024)} KB
                    </td>
                    <td className="p-2.5 text-[#50575e]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attachment Details Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-4 py-3 bg-[#1d2327] text-white flex justify-between items-center select-none">
                <span className="font-semibold text-sm">Attachment Details</span>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Left image preview, Right metadata editor */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
                {/* Left: Media Preview */}
                <div className="md:col-span-7 bg-[#f6f7f7] border border-[#dcdcde] rounded flex items-center justify-center p-4 min-h-[300px]">
                  {selectedMedia.mimeType.startsWith('image') ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.altText || selectedMedia.filename}
                      className="max-h-[380px] w-auto max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-8 text-[#646970]">
                      <FileText className="w-16 h-16 mx-auto mb-2" />
                      <p className="font-semibold text-sm">{selectedMedia.filename}</p>
                      <p className="text-xs">{selectedMedia.mimeType}</p>
                    </div>
                  )}
                </div>

                {/* Right: Metadata Form & Info */}
                <div className="md:col-span-5 space-y-4 text-xs">
                  {/* File Info */}
                  <div className="p-3 bg-[#f8f9fa] border border-[#e2e4e7] rounded space-y-1 text-[#646970]">
                    <div>
                      <strong>File name:</strong>{' '}
                      <span className="text-[#1d2327] font-mono break-all">
                        {selectedMedia.filename}
                      </span>
                    </div>
                    <div>
                      <strong>File type:</strong> {selectedMedia.mimeType}
                    </div>
                    <div>
                      <strong>Uploaded on:</strong>{' '}
                      {new Date(selectedMedia.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File size:</strong>{' '}
                      {Math.round(selectedMedia.size / 1024)} KB
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label className="block font-semibold text-[#2c3338] mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={editAltText}
                      onChange={(e) => setEditAltText(e.target.value)}
                      placeholder="Alternative text for screen readers..."
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2c3338] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2c3338] mb-1">
                      Caption
                    </label>
                    <textarea
                      rows={2}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  {/* Copy Link Button */}
                  <div>
                    <label className="block font-semibold text-[#2c3338] mb-1">
                      File URL
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedMedia.url}
                        className="flex-1 px-2.5 py-1 border border-[#dcdcde] rounded bg-[#f6f7f7] font-mono text-[11px] text-[#50575e]"
                      />
                      <button
                        type="button"
                        onClick={() => copyUrlToClipboard(selectedMedia.url)}
                        title="Copy URL"
                        className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded text-[#2271b1]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#dcdcde]">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMedia.id)}
                      className="text-[#b32d2e] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete permanently
                    </button>
                    <button
                      type="button"
                      disabled={savingDetails}
                      onClick={saveDetails}
                      className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold disabled:opacity-50"
                    >
                      {savingDetails ? 'Saving...' : 'Save Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

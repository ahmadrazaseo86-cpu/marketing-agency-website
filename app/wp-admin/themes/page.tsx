'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { Palette, CheckCircle2, Eye, ExternalLink, X, Plus } from 'lucide-react';

interface ThemeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isActive: boolean;
  previewUrl?: string | null;
}

export default function ThemesPage() {
  const { addToast } = useToast();
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<ThemeItem | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      if (res.ok) {
        setThemes(data.themes || []);
      }
    } catch {
      addToast('Error loading themes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleActivate = async (theme: ThemeItem) => {
    setActivatingId(theme.id);
    try {
      const res = await fetch('/api/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: theme.id }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Theme "${theme.name}" activated!`, 'success');
        fetchThemes();
        setPreviewTheme(null);
      } else {
        addToast(data.error || 'Failed to activate theme', 'error');
      }
    } catch {
      addToast('Error activating theme', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  const activeTheme = themes.find((t) => t.isActive);
  const inactiveThemes = themes.filter((t) => !t.isActive);

  return (
    <AdminLayout title="Themes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Themes</h1>
            <button
              type="button"
              onClick={() =>
                addToast('Theme installation repository is enabled in demo mode.', 'info')
              }
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Theme
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading themes...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Theme Highlight */}
            {activeTheme && (
              <div className="bg-white border-2 border-[#2271b1] rounded shadow-md overflow-hidden p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-80 h-52 bg-[#f0f0f1] rounded border border-[#dcdcde] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {activeTheme.previewUrl ? (
                    <img
                      src={activeTheme.previewUrl}
                      alt={activeTheme.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Palette className="w-16 h-16 text-[#646970]" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00a32a]/10 text-[#00a32a] font-semibold text-xs mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Theme
                    </div>
                    <h2 className="text-xl font-bold text-[#1d2327]">
                      {activeTheme.name}{' '}
                      <span className="text-xs font-normal text-[#646970]">
                        Version {activeTheme.version}
                      </span>
                    </h2>
                    <p className="text-xs text-[#50575e] mt-1 mb-3">
                      By <strong className="text-[#1d2327]">{activeTheme.author}</strong>
                    </p>
                    <p className="text-xs text-[#2c3338] leading-relaxed max-w-2xl">
                      {activeTheme.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(activeTheme)}
                      className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Palette className="w-3.5 h-3.5" /> Customize
                    </button>
                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-white border border-[#c3c4c7] hover:bg-[#f6f7f7] text-[#2c3338] rounded text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      Visit Site <ExternalLink className="w-3.5 h-3.5 text-[#646970]" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Other Available Themes Grid */}
            <div>
              <h2 className="text-lg font-semibold text-[#1d2327] mb-4">
                Available Themes ({inactiveThemes.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {inactiveThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="bg-white border border-[#c3c4c7] hover:border-[#2271b1] rounded shadow-sm overflow-hidden flex flex-col group transition-all"
                  >
                    <div className="relative h-48 bg-[#f0f0f1] overflow-hidden flex items-center justify-center border-b border-[#dcdcde]">
                      {theme.previewUrl ? (
                        <img
                          src={theme.previewUrl}
                          alt={theme.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <Palette className="w-12 h-12 text-[#646970]" />
                      )}

                      {/* Hover Overlay with Activate & Live Preview */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                        <button
                          type="button"
                          disabled={activatingId === theme.id}
                          onClick={() => handleActivate(theme)}
                          className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow"
                        >
                          {activatingId === theme.id ? 'Activating...' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTheme(theme)}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#f6f7f7] text-[#1d2327] rounded font-semibold text-xs shadow"
                        >
                          Live Preview
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-[#1d2327]">
                          {theme.name}
                        </h3>
                        <div className="text-[11px] text-[#646970]">
                          By {theme.author}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleActivate(theme)}
                        className="px-3 py-1 text-xs font-semibold text-[#2271b1] hover:bg-[#2271b1] hover:text-white border border-[#2271b1] rounded transition-colors"
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Preview / Details Modal */}
        {previewTheme && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-[#1d2327] text-white flex justify-between items-center select-none">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#2271b1]" /> Theme Preview: {previewTheme.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewTheme(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {previewTheme.previewUrl && (
                  <img
                    src={previewTheme.previewUrl}
                    alt={previewTheme.name}
                    className="w-full h-80 object-cover rounded-md border"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-[#1d2327]">{previewTheme.name}</h2>
                  <p className="text-xs text-[#646970]">
                    Version {previewTheme.version} | By {previewTheme.author}
                  </p>
                  <p className="text-xs text-[#2c3338] leading-relaxed mt-3">
                    {previewTheme.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-100 border-t flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPreviewTheme(null)}
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700"
                >
                  Close
                </button>
                {!previewTheme.isActive && (
                  <button
                    type="button"
                    onClick={() => handleActivate(previewTheme)}
                    className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm"
                  >
                    Activate & Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

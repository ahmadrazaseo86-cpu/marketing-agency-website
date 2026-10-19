'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { Save, Check, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'general' | 'writing' | 'reading' | 'discussion' | 'media' | 'permalinks'
  >('general');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [form, setForm] = useState<Record<string, string>>({
    // General
    site_title: 'Starter Marketing',
    site_tagline: 'Just another WordPress site',
    site_url: 'http://localhost:3000',
    admin_email: 'admin@startermarketing.com',
    users_can_register: '0',
    default_role: 'SUBSCRIBER',
    timezone: 'UTC+5',
    date_format: 'F j, Y',
    time_format: 'g:i a',
    week_starts_on: '1',

    // Writing
    default_post_category: '1',
    default_post_format: 'standard',

    // Reading
    homepage_displays: 'posts', // 'posts' or 'page'
    posts_per_page: '10',
    search_engine_visibility: '1',

    // Discussion
    allow_comments: '1',
    comment_moderation: '1',
    email_on_comment: '1',

    // Media
    thumbnail_size_w: '150',
    thumbnail_size_h: '150',
    medium_size_w: '300',
    medium_size_h: '300',
    large_size_w: '1024',
    large_size_h: '1024',

    // Permalinks
    permalink_structure: '/%postname%/',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setForm((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Settings saved successfully.', 'success');
      } else {
        addToast(data.error || 'Failed to save settings', 'error');
      }
    } catch {
      addToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-normal text-[#1d2327]">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
        </h1>

        {/* Settings Navigation Tabs (WordPress Style) */}
        <div className="flex flex-wrap items-center gap-1 border-b border-[#c3c4c7] pb-[-1px] text-xs">
          {[
            { id: 'general', label: 'General' },
            { id: 'writing', label: 'Writing' },
            { id: 'reading', label: 'Reading' },
            { id: 'discussion', label: 'Discussion' },
            { id: 'media', label: 'Media' },
            { id: 'permalinks', label: 'Permalinks' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 font-semibold border-t border-x rounded-t transition-colors -mb-[1px] ${
                activeTab === tab.id
                  ? 'bg-white border-[#c3c4c7] text-[#2271b1] border-b-2 border-b-white'
                  : 'bg-[#f6f7f7] border-transparent text-[#646970] hover:text-[#1d2327]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading settings...
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-white p-6 border border-[#c3c4c7] rounded shadow-sm space-y-6 text-xs"
          >
            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Site Title</label>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={form.site_title || ''}
                      onChange={(e) => handleChange('site_title', e.target.value)}
                      className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Tagline</label>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={form.site_tagline || ''}
                      onChange={(e) => handleChange('site_tagline', e.target.value)}
                      className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
                    />
                    <p className="text-[11px] text-[#646970] mt-1">
                      In a few words, explain what this site is about.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">WordPress Address (URL)</label>
                  <div className="md:col-span-3">
                    <input
                      type="url"
                      value={form.site_url || ''}
                      onChange={(e) => handleChange('site_url', e.target.value)}
                      className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Administration Email Address</label>
                  <div className="md:col-span-3">
                    <input
                      type="email"
                      value={form.admin_email || ''}
                      onChange={(e) => handleChange('admin_email', e.target.value)}
                      className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
                    />
                    <p className="text-[11px] text-[#646970] mt-1">
                      This address is used for admin purposes, like new user notifications.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Membership</label>
                  <div className="md:col-span-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.users_can_register === '1'}
                        onChange={(e) =>
                          handleChange('users_can_register', e.target.checked ? '1' : '0')
                        }
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>Anyone can register</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">New User Default Role</label>
                  <div className="md:col-span-3">
                    <select
                      value={form.default_role || 'SUBSCRIBER'}
                      onChange={(e) => handleChange('default_role', e.target.value)}
                      className="px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                    >
                      <option value="SUBSCRIBER">Subscriber</option>
                      <option value="CONTRIBUTOR">Contributor</option>
                      <option value="AUTHOR">Author</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Timezone</label>
                  <div className="md:col-span-3">
                    <select
                      value={form.timezone || 'UTC+5'}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                    >
                      <option value="UTC+5">UTC+5 (Pakistan Standard Time, Karachi)</option>
                      <option value="UTC+0">UTC+0 (London, GMT)</option>
                      <option value="UTC-5">UTC-5 (New York, EST)</option>
                      <option value="UTC-8">UTC-8 (Los Angeles, PST)</option>
                      <option value="UTC+4">UTC+4 (Dubai, GST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* WRITING SETTINGS */}
            {activeTab === 'writing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Default Post Category</label>
                  <div className="md:col-span-3">
                    <select
                      value={form.default_post_category || '1'}
                      onChange={(e) => handleChange('default_post_category', e.target.value)}
                      className="px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                    >
                      <option value="1">Uncategorized</option>
                      <option value="2">SEO</option>
                      <option value="3">Digital Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Default Post Format</label>
                  <div className="md:col-span-3">
                    <select
                      value={form.default_post_format || 'standard'}
                      onChange={(e) => handleChange('default_post_format', e.target.value)}
                      className="px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs"
                    >
                      <option value="standard">Standard</option>
                      <option value="aside">Aside</option>
                      <option value="gallery">Gallery</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* READING SETTINGS */}
            {activeTab === 'reading' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2">
                  <label className="font-semibold text-[#2c3338] pt-1">Your homepage displays</label>
                  <div className="md:col-span-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="homepage_displays"
                        checked={form.homepage_displays === 'posts'}
                        onChange={() => handleChange('homepage_displays', 'posts')}
                        className="text-[#2271b1]"
                      />
                      <span>Your latest posts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="homepage_displays"
                        checked={form.homepage_displays === 'page'}
                        onChange={() => handleChange('homepage_displays', 'page')}
                        className="text-[#2271b1]"
                      />
                      <span>A static page (select below)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Blog pages show at most</label>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.posts_per_page || '10'}
                      onChange={(e) => handleChange('posts_per_page', e.target.value)}
                      className="w-20 px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                    <span>posts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Search engine visibility</label>
                  <div className="md:col-span-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.search_engine_visibility === '1'}
                        onChange={(e) =>
                          handleChange('search_engine_visibility', e.target.checked ? '1' : '0')
                        }
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>Discourage search engines from indexing this site</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* DISCUSSION SETTINGS */}
            {activeTab === 'discussion' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2">
                  <label className="font-semibold text-[#2c3338] pt-1">Default post settings</label>
                  <div className="md:col-span-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allow_comments === '1'}
                        onChange={(e) =>
                          handleChange('allow_comments', e.target.checked ? '1' : '0')
                        }
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>Allow people to submit comments on new posts</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2">
                  <label className="font-semibold text-[#2c3338] pt-1">Before a comment appears</label>
                  <div className="md:col-span-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.comment_moderation === '1'}
                        onChange={(e) =>
                          handleChange('comment_moderation', e.target.checked ? '1' : '0')
                        }
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>Comment must be manually approved</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* MEDIA SETTINGS */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <p className="text-xs text-[#646970]">
                  The sizes listed below determine the maximum dimensions in pixels to use when
                  inserting an image into the body of a post.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Thumbnail size</label>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <span>Width:</span>
                    <input
                      type="number"
                      value={form.thumbnail_size_w || '150'}
                      onChange={(e) => handleChange('thumbnail_size_w', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                    <span>Height:</span>
                    <input
                      type="number"
                      value={form.thumbnail_size_h || '150'}
                      onChange={(e) => handleChange('thumbnail_size_h', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Medium size</label>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <span>Max Width:</span>
                    <input
                      type="number"
                      value={form.medium_size_w || '300'}
                      onChange={(e) => handleChange('medium_size_w', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                    <span>Max Height:</span>
                    <input
                      type="number"
                      value={form.medium_size_h || '300'}
                      onChange={(e) => handleChange('medium_size_h', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="font-semibold text-[#2c3338]">Large size</label>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <span>Max Width:</span>
                    <input
                      type="number"
                      value={form.large_size_w || '1024'}
                      onChange={(e) => handleChange('large_size_w', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                    <span>Max Height:</span>
                    <input
                      type="number"
                      value={form.large_size_h || '1024'}
                      onChange={(e) => handleChange('large_size_h', e.target.value)}
                      className="w-20 px-2 py-1 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PERMALINK SETTINGS */}
            {activeTab === 'permalinks' && (
              <div className="space-y-4">
                <p className="text-xs text-[#646970]">
                  WordPress offers you the ability to create a custom URL structure for your
                  permalinks and archives.
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'Plain', val: '/?p=123' },
                    { label: 'Day and name', val: '/%year%/%monthnum%/%day%/%postname%/' },
                    { label: 'Month and name', val: '/%year%/%monthnum%/%postname%/' },
                    { label: 'Numeric', val: '/archives/%post_id%' },
                    { label: 'Post name (Recommended)', val: '/%postname%/' },
                  ].map((item) => (
                    <label key={item.val} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="permalink_structure"
                        checked={form.permalink_structure === item.val}
                        onChange={() => handleChange('permalink_structure', item.val)}
                        className="text-[#2271b1]"
                      />
                      <span className="font-semibold w-48">{item.label}</span>
                      <code className="bg-[#f0f0f1] px-2 py-0.5 rounded text-[11px] text-[#50575e]">
                        http://localhost:3000{item.val}
                      </code>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-[#dcdcde] flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

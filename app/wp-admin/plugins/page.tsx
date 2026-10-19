'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { Plus, Check, Power, Trash2, Settings, ExternalLink } from 'lucide-react';

interface PluginItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isActive: boolean;
}

export default function PluginsPage() {
  const { addToast } = useToast();
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentTab !== 'all') q.set('status', currentTab);

      const res = await fetch(`/api/plugins?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPlugins(data.plugins || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch {
      addToast('Error loading plugins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [currentTab]);

  const handleToggleActive = async (plugin: PluginItem) => {
    const nextState = !plugin.isActive;
    try {
      const res = await fetch('/api/plugins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plugin.id, isActive: nextState }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(
          `Plugin "${plugin.name}" ${nextState ? 'activated' : 'deactivated'}.`,
          'success'
        );
        fetchPlugins();
      } else {
        addToast(data.error || 'Failed to update plugin', 'error');
      }
    } catch {
      addToast('Error toggling plugin', 'error');
    }
  };

  const handleDelete = async (plugin: PluginItem) => {
    if (!confirm(`Are you sure you want to delete ${plugin.name} and its data?`)) return;
    try {
      const res = await fetch(`/api/plugins?id=${plugin.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`Plugin "${plugin.name}" deleted.`, 'success');
        fetchPlugins();
      }
    } catch {
      addToast('Failed to delete plugin', 'error');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(plugins.map((p) => p.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    for (const id of selectedIds) {
      if (bulkAction === 'activate') {
        await fetch('/api/plugins', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isActive: true }),
        });
      } else if (bulkAction === 'deactivate') {
        await fetch('/api/plugins', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isActive: false }),
        });
      } else if (bulkAction === 'delete') {
        await fetch(`/api/plugins?id=${id}`, { method: 'DELETE' });
      }
    }

    addToast(`Bulk action applied to ${selectedIds.length} plugins.`, 'success');
    setSelectedIds([]);
    fetchPlugins();
  };

  const handleAddSamplePlugin = async () => {
    const name = prompt('Enter Plugin Name:', 'WP Super Cache');
    if (!name?.trim()) return;

    try {
      const res = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: 'A very fast caching engine for WordPress that produces static html files.',
          version: '1.9.4',
          author: 'Automattic',
        }),
      });
      if (res.ok) {
        addToast(`Plugin "${name}" installed!`, 'success');
        fetchPlugins();
      }
    } catch {
      addToast('Failed to install plugin', 'error');
    }
  };

  return (
    <AdminLayout title="Plugins">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Plugins</h1>
            <button
              type="button"
              onClick={handleAddSamplePlugin}
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Plugin
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 text-xs text-[#646970] border-b border-[#dcdcde] pb-2">
          <button
            type="button"
            onClick={() => setCurrentTab('all')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'all' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            All <span className="text-[#8c8f94]">({counts.all})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('active')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'active' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Active <span className="text-[#8c8f94]">({counts.active})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentTab('inactive')}
            className={`hover:text-[#2271b1] ${
              currentTab === 'inactive' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Inactive <span className="text-[#8c8f94]">({counts.inactive})</span>
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
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
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
            <span>{plugins.length} items</span>
          </div>
        </div>

        {/* Plugins Table */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={plugins.length > 0 && selectedIds.length === plugins.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#8c8f94] text-[#2271b1]"
                  />
                </th>
                <th className="p-2.5 w-60">Plugin</th>
                <th className="p-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcdcde]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[#646970]">
                    Loading plugins...
                  </td>
                </tr>
              ) : plugins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[#646970]">
                    No plugins found.
                  </td>
                </tr>
              ) : (
                plugins.map((plugin) => (
                  <tr
                    key={plugin.id}
                    className={`hover:bg-[#f6f7f7] transition-colors ${
                      plugin.isActive
                        ? 'bg-[#f0f6fc] border-l-4 border-l-[#2271b1]'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <td className="p-2.5 text-center align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(plugin.id)}
                        onChange={() => handleSelectOne(plugin.id)}
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                    </td>

                    {/* Plugin Name & Row Actions */}
                    <td className="p-2.5 align-top">
                      <div className="font-semibold text-sm text-[#1d2327]">
                        {plugin.name}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#646970]">
                        {plugin.isActive ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(plugin)}
                              className="text-[#b32d2e] hover:underline font-medium"
                            >
                              Deactivate
                            </button>
                            <span>|</span>
                            <button
                              type="button"
                              onClick={() => addToast(`Settings for ${plugin.name} loaded.`, 'info')}
                              className="text-[#2271b1] hover:underline"
                            >
                              Settings
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(plugin)}
                              className="text-[#2271b1] hover:underline font-semibold"
                            >
                              Activate
                            </button>
                            <span>|</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(plugin)}
                              className="text-[#b32d2e] hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Plugin Description & Metadata */}
                    <td className="p-2.5 align-top">
                      <p className="text-[#2c3338] leading-relaxed mb-1">
                        {plugin.description}
                      </p>
                      <div className="text-[11px] text-[#646970] flex items-center gap-3">
                        <span>Version {plugin.version}</span>
                        <span>|</span>
                        <span>
                          By <strong className="text-[#1d2327]">{plugin.author}</strong>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import {
  Activity,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Server,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ToolsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'health' | 'export' | 'import'>('health');

  // Site Health state
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [openCheckIndex, setOpenCheckIndex] = useState<number | null>(null);

  // Export state
  const [exportContent, setExportContent] = useState('all');

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (activeTab === 'health') {
      setLoadingHealth(true);
      fetch('/api/tools/site-health')
        .then((r) => r.json())
        .then((data) => setHealthData(data.siteHealth))
        .catch(() => addToast('Failed to run site health check', 'error'))
        .finally(() => setLoadingHealth(false));
    }
  }, [activeTab]);

  const handleExportDownload = () => {
    window.location.href = `/api/tools/export?content=${exportContent}`;
    addToast('Downloading export archive...', 'info');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      addToast('Please select a JSON file to import.', 'warning');
      return;
    }

    setImporting(true);
    try {
      const text = await importFile.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/tools/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Import successful!', 'success');
        setImportFile(null);
      } else {
        addToast(data.error || 'Import failed', 'error');
      }
    } catch (err: any) {
      addToast('Invalid JSON file format', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Tools">
      <div className="space-y-4 max-w-4xl">
        <h1 className="text-2xl font-normal text-[#1d2327]">Tools</h1>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#c3c4c7] pb-[-1px] text-xs">
          {[
            { id: 'health', label: 'Site Health', icon: Activity },
            { id: 'export', label: 'Export', icon: Download },
            { id: 'import', label: 'Import', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 font-semibold border-t border-x rounded-t transition-colors -mb-[1px] flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white border-[#c3c4c7] text-[#2271b1] border-b-2 border-b-white'
                    : 'bg-[#f6f7f7] border-transparent text-[#646970] hover:text-[#1d2327]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SITE HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-5">
            {loadingHealth ? (
              <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7]">
                Running system health diagnostics...
              </div>
            ) : healthData ? (
              <>
                {/* Health Overview Banner */}
                <div className="bg-white p-5 border border-[#c3c4c7] rounded shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[#1d2327]">
                      Site Health Status
                    </h2>
                    <p className="text-xs text-[#646970] mt-1">
                      The site health check shows critical information about your WordPress
                      configuration and items that may need your attention.
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-[#00a32a]/10 border border-[#00a32a]/20 text-[#00a32a] font-bold text-sm rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {healthData.score}
                  </div>
                </div>

                {/* Checks List */}
                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm divide-y divide-[#dcdcde] text-xs">
                  {healthData.checks.map((item: any, idx: number) => (
                    <div key={idx} className="overflow-hidden">
                      <div
                        onClick={() =>
                          setOpenCheckIndex(openCheckIndex === idx ? null : idx)
                        }
                        className="p-3.5 flex items-center justify-between hover:bg-[#f6f7f7] cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.status === 'good' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#00a32a] flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-[#dba617] flex-shrink-0" />
                          )}
                          <span className="font-semibold text-[#1d2327]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#646970]">
                          <span className="text-[11px] uppercase font-medium">
                            {item.test}
                          </span>
                          {openCheckIndex === idx ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {openCheckIndex === idx && (
                        <div className="px-10 pb-4 pt-1 bg-[#fbfbfc] text-[#50575e] leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* System Info Info Box */}
                <div className="bg-white p-5 border border-[#c3c4c7] rounded shadow-sm text-xs">
                  <h3 className="font-semibold text-sm text-[#1d2327] mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#2271b1]" /> System Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#50575e]">
                    <div className="p-2.5 bg-[#f6f7f7] rounded border border-[#dcdcde]">
                      <div className="text-[11px] text-[#646970]">Node Version</div>
                      <div className="font-bold text-[#1d2327] mt-0.5 font-mono">
                        {healthData.system.nodeVersion}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#f6f7f7] rounded border border-[#dcdcde]">
                      <div className="text-[11px] text-[#646970]">Platform</div>
                      <div className="font-bold text-[#1d2327] mt-0.5 capitalize">
                        {healthData.system.platform}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#f6f7f7] rounded border border-[#dcdcde]">
                      <div className="text-[11px] text-[#646970]">Total Posts</div>
                      <div className="font-bold text-[#1d2327] mt-0.5">
                        {healthData.system.postsCount}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#f6f7f7] rounded border border-[#dcdcde]">
                      <div className="text-[11px] text-[#646970]">Total Users</div>
                      <div className="font-bold text-[#1d2327] mt-0.5">
                        {healthData.system.usersCount}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="bg-white p-6 border border-[#c3c4c7] rounded shadow-sm space-y-5 text-xs">
            <div>
              <h2 className="text-base font-semibold text-[#1d2327]">Export Content</h2>
              <p className="text-[#646970] mt-1 leading-relaxed">
                When you click the button below WordPress will create an export archive in JSON
                format for you to save to your computer. This format contains your posts, pages,
                comments, custom fields, categories, and tags.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="font-semibold text-[#2c3338] block">Choose what to export:</span>

              {[
                { val: 'all', label: 'All content (Posts, Pages, Comments, Categories, Media)' },
                { val: 'posts', label: 'Posts only' },
                { val: 'pages', label: 'Pages only' },
                { val: 'comments', label: 'Comments only' },
                { val: 'categories', label: 'Categories and Tags only' },
                { val: 'media', label: 'Media library entries only' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="exportContent"
                    checked={exportContent === item.val}
                    onChange={() => setExportContent(item.val)}
                    className="text-[#2271b1]"
                  />
                  <span className="text-[#2c3338]">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-[#dcdcde]">
              <button
                type="button"
                onClick={handleExportDownload}
                className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Export File
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: IMPORT */}
        {activeTab === 'import' && (
          <div className="bg-white p-6 border border-[#c3c4c7] rounded shadow-sm space-y-5 text-xs">
            <div>
              <h2 className="text-base font-semibold text-[#1d2327]">Import Content</h2>
              <p className="text-[#646970] mt-1 leading-relaxed">
                If you have posts or categories in a WordPress JSON export file, you can upload
                and import them into this site.
              </p>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-[#c3c4c7] p-8 rounded text-center">
                <FileCode className="w-10 h-10 mx-auto text-[#8c8f94] mb-2" />
                <label className="block text-xs font-semibold text-[#2c3338] mb-2">
                  Choose a (.json) file from your computer:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-[#646970]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {importing ? 'Importing...' : 'Upload file and import'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

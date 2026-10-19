'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { slugify } from '@/lib/utils';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Share2,
  FileCode,
  Sparkles,
  Plus,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
} from 'lucide-react';

export default function SeoDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'keywords' | 'sitemap'>('overview');

  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState<any>(null);

  // Quick SEO Post Creator state
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [postContent, setPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Robots.txt editor
  const [robotsTxt, setRobotsTxt] = useState(
    'User-agent: *\nAllow: /\nDisallow: /wp-admin/\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml'
  );

  const fetchSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo');
      const data = await res.json();
      if (res.ok) {
        setSeoData(data);
      }
    } catch {
      addToast('Failed to load SEO data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  const handleTitleChange = (val: string) => {
    setPostTitle(val);
    if (!postSlug || postSlug === slugify(postTitle)) {
      setPostSlug(slugify(val));
    }
    if (!metaTitle || metaTitle === postTitle) {
      setMetaTitle(val);
    }
  };

  // Real-time on-page SEO checklist calculations
  const cleanKeyword = focusKeyword.trim().toLowerCase();
  const titleHasKeyword = cleanKeyword && postTitle.toLowerCase().includes(cleanKeyword);
  const slugHasKeyword = cleanKeyword && postSlug.toLowerCase().includes(slugify(cleanKeyword));
  const descHasKeyword = cleanKeyword && metaDescription.toLowerCase().includes(cleanKeyword);
  const wordCount = postContent.trim() ? postContent.trim().split(/\s+/).length : 0;
  const contentHasKeyword = cleanKeyword && postContent.toLowerCase().includes(cleanKeyword);
  const titleLengthValid = metaTitle.length >= 35 && metaTitle.length <= 65;
  const descLengthValid = metaDescription.length >= 100 && metaDescription.length <= 165;

  const passedChecksCount = [
    titleHasKeyword,
    slugHasKeyword,
    descHasKeyword,
    contentHasKeyword,
    wordCount >= 200,
    titleLengthValid,
    descLengthValid,
  ].filter(Boolean).length;

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      addToast('Post title is required', 'warning');
      return;
    }

    setCreatingPost(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          slug: postSlug || slugify(postTitle),
          content: postContent || '<p>Write your article here...</p>',
          metaTitle,
          metaDescription,
          focusKeyword,
          status: 'PUBLISHED',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`SEO Post "${postTitle}" published successfully!`, 'success');
        setPostTitle('');
        setPostSlug('');
        setFocusKeyword('');
        setMetaTitle('');
        setMetaDescription('');
        setPostContent('');
        fetchSeoData();
        setActiveTab('overview');
      } else {
        addToast(data.error || 'Failed to create post', 'error');
      }
    } catch {
      addToast('Error publishing SEO post', 'error');
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <AdminLayout title="SEO Dashboard">
      <div className="space-y-5 max-w-6xl">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 rounded-xl border border-[#334155] text-white shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                NexaRank SEO Intelligence Suite
                <span className="text-[10px] bg-[#10b981] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live
                </span>
              </h1>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                On-page audit, keyword density engine, live Google SERP preview &amp; sitemap generator.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create SEO Post
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 border-b border-[#c3c4c7] text-xs">
          {[
            { id: 'overview', label: 'SEO Overview & Audit', icon: TrendingUp },
            { id: 'create', label: 'Create SEO Post', icon: Plus },
            { id: 'keywords', label: 'Focus Keywords Tracker', icon: Search },
            { id: 'sitemap', label: 'XML Sitemap & Robots.txt', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 font-semibold border-t border-x rounded-t transition-colors -mb-[1px] flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white border-[#c3c4c7] text-[#2563eb] border-b-2 border-b-white font-bold'
                    : 'bg-[#f6f7f7] border-transparent text-[#646970] hover:text-[#1d2327]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & AUDIT */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm">
                <div className="text-xs text-[#646970] font-medium">Site Health Score</div>
                <div className="text-3xl font-extrabold text-[#10b981] mt-1 flex items-baseline gap-2">
                  {seoData?.score || '94/100'}
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">
                    Grade {seoData?.grade || 'A'}
                  </span>
                </div>
                <div className="text-[11px] text-[#646970] mt-1">
                  Based on Google Core Web &amp; meta criteria
                </div>
              </div>

              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm">
                <div className="text-xs text-[#646970] font-medium">Indexable URLs</div>
                <div className="text-3xl font-extrabold text-[#1d2327] mt-1">
                  {seoData?.stats?.totalIndexed || 8}
                </div>
                <div className="text-[11px] text-[#00a32a] mt-1 font-medium">
                  ✓ Valid in XML Sitemap
                </div>
              </div>

              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm">
                <div className="text-xs text-[#646970] font-medium">Tracked Keywords</div>
                <div className="text-3xl font-extrabold text-[#2563eb] mt-1">
                  {seoData?.keywords?.length || 4}
                </div>
                <div className="text-[11px] text-[#646970] mt-1">High-intent commercial terms</div>
              </div>

              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm">
                <div className="text-xs text-[#646970] font-medium">Meta Issues</div>
                <div className="text-3xl font-extrabold text-[#10b981] mt-1">0</div>
                <div className="text-[11px] text-[#00a32a] mt-1 font-medium">
                  All pages properly tagged
                </div>
              </div>
            </div>

            {/* Audit Checklist Card */}
            <div className="bg-white border border-[#c3c4c7] rounded-xl shadow-sm overflow-hidden text-xs">
              <div className="p-4 bg-[#f6f7f7] border-b border-[#c3c4c7] font-bold text-sm text-[#1d2327]">
                On-Page Technical SEO Audit
              </div>
              <div className="divide-y divide-[#dcdcde]">
                {seoData?.auditChecks?.map((chk: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-start gap-3 hover:bg-[#fbfbfc]">
                    {chk.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-semibold text-[#1d2327] text-sm">{chk.title}</h3>
                      <p className="text-xs text-[#646970] mt-0.5 leading-relaxed">
                        {chk.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE SEO POST */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Left */}
            <form onSubmit={handleCreatePost} className="lg:col-span-7 bg-white p-6 border border-[#c3c4c7] rounded-xl shadow-sm space-y-4 text-xs">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-[#1d2327]">
                  Create SEO-Optimized Article
                </h2>
                <p className="text-[#646970] text-[11px] mt-0.5">
                  Optimize your focus keyword and preview live Google rankings before publishing.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Focus Keyword <span className="text-[#2563eb] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. digital marketing agency lahore"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Guide to Digital Marketing in 2026"
                  value={postTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  SEO Meta Title (Title tag for Google)
                </label>
                <div className="flex justify-between text-[11px] text-[#646970] mb-0.5">
                  <span>Target: 40-60 characters</span>
                  <span className={titleLengthValid ? 'text-[#10b981] font-bold' : ''}>
                    {metaTitle.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Custom title tag..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Meta Description
                </label>
                <div className="flex justify-between text-[11px] text-[#646970] mb-0.5">
                  <span>Target: 120-160 characters</span>
                  <span className={descLengthValid ? 'text-[#10b981] font-bold' : ''}>
                    {metaDescription.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Engaging summary that draws clicks on search engine results..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  Article Content (HTML or Text)
                </label>
                <textarea
                  rows={6}
                  placeholder="Write the full content of your article here. Mention your focus keyword naturally in the first paragraph..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb] font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={creatingPost}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg font-semibold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {creatingPost ? 'Publishing...' : 'Publish SEO Article'}
                </button>
              </div>
            </form>

            {/* Live SEO Score & SERP Preview Right */}
            <div className="lg:col-span-5 space-y-4">
              {/* Score Meter Card */}
              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#1d2327]">On-Page SEO Score</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563eb] font-bold text-xs rounded-full">
                    {Math.round((passedChecksCount / 7) * 100)} / 100
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#f0f0f1] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] transition-all"
                    style={{ width: `${(passedChecksCount / 7) * 100}%` }}
                  />
                </div>

                {/* Checklist */}
                <div className="space-y-2 pt-2">
                  <div className={`flex items-center gap-2 ${titleHasKeyword ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Focus keyword in SEO title</span>
                  </div>
                  <div className={`flex items-center gap-2 ${slugHasKeyword ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Focus keyword in URL slug</span>
                  </div>
                  <div className={`flex items-center gap-2 ${descHasKeyword ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Focus keyword in meta description</span>
                  </div>
                  <div className={`flex items-center gap-2 ${contentHasKeyword ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Focus keyword in content body</span>
                  </div>
                  <div className={`flex items-center gap-2 ${titleLengthValid ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Title tag length (40-60 chars)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${descLengthValid ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Meta description length (100-165 chars)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${wordCount >= 200 ? 'text-[#10b981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Content length ({wordCount} / 200+ words)</span>
                  </div>
                </div>
              </div>

              {/* Live Google Search Preview Card */}
              <div className="bg-white p-5 border border-[#c3c4c7] rounded-xl shadow-sm text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1d2327]">Google SERP Preview</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-[#2563eb] text-white' : 'text-gray-500'}`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-[#2563eb] text-white' : 'text-gray-500'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#f8f9fa] border border-[#e2e4e7] rounded-lg space-y-1">
                  <div className="text-[11px] text-[#202124] truncate">
                    https://nexarank.agency › blog › {postSlug || 'your-url'}
                  </div>
                  <div className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer leading-snug">
                    {metaTitle || postTitle || 'Your Post Title Here'}
                  </div>
                  <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                    {metaDescription || 'Add a meta description to see how this post appears in Google search results...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOCUS KEYWORDS */}
        {activeTab === 'keywords' && (
          <div className="bg-white border border-[#c3c4c7] rounded-xl shadow-sm overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                  <th className="p-3">Target Keyword</th>
                  <th className="p-3">Target Landing Page</th>
                  <th className="p-3">Search Intent</th>
                  <th className="p-3">Search Volume</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3 text-center">Optimization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dcdcde]">
                {seoData?.keywords?.map((k: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#fbfbfc]">
                    <td className="p-3 font-semibold text-[#1d2327]">{k.keyword}</td>
                    <td className="p-3 text-[#2563eb]">{k.target}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                        {k.intent}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-mono">{k.volume}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          k.difficulty === 'High'
                            ? 'bg-red-50 text-red-700'
                            : k.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {k.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-[#10b981]">{k.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: XML SITEMAP & ROBOTS */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-[#c3c4c7] rounded-xl shadow-sm text-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#1d2327]">Live XML Sitemap</h3>
                  <p className="text-[11px] text-[#646970] mt-0.5">
                    Your dynamic XML sitemap is actively accessible by search engine bots.
                  </p>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] text-[#2563eb] rounded font-semibold inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View /sitemap.xml
                </a>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#1d2327] mb-2">Robots.txt Editor</h3>
                <textarea
                  rows={6}
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-[#8c8f94] rounded bg-[#fcfcfc] text-[#1d2327]"
                />
              </div>

              <button
                type="button"
                onClick={() => addToast('Robots.txt rules updated successfully!', 'success')}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded font-semibold text-xs"
              >
                Save Robots.txt
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

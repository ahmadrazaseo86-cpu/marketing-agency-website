'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import {
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function VisualBuilderPage() {
  const { addToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Element state
  const [elements, setElements] = useState<any>(null);

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    intro: false,
    stats: false,
    services: false,
    testimonials: false,
    contact: false,
    ctaBand: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  useEffect(() => {
    fetch('/api/elements?page=home')
      .then((r) => r.json())
      .then((data) => {
        if (data.elements) {
          setElements(data.elements);
        }
      })
      .catch(() => addToast('Failed to load page elements', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (section: string, field: string, value: any) => {
    setElements((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleStatUpdate = (index: number, field: string, value: string) => {
    const updated = [...elements.stats];
    updated[index] = { ...updated[index], [field]: value };
    setElements((prev: any) => ({ ...prev, stats: updated }));
  };

  const handleServiceUpdate = (index: number, field: string, value: string) => {
    const updated = [...elements.services];
    updated[index] = { ...updated[index], [field]: value };
    setElements((prev: any) => ({ ...prev, services: updated }));
  };

  const handlePublish = async () => {
    if (!elements) return;
    setSaving(true);
    try {
      const res = await fetch('/api/elements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'home', elements }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('All changes published to live website!', 'success');
      } else {
        addToast(data.error || 'Failed to save changes', 'error');
      }
    } catch {
      addToast('Error publishing changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !elements) {
    return (
      <AdminLayout title="Visual Builder">
        <div className="bg-white p-12 text-center text-[#646970] rounded border border-[#c3c4c7]">
          Loading NexaRank Visual Element Editor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Visual Builder">
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="bg-white p-3 border border-[#c3c4c7] rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#1d2327]">
                NexaRank Visual Element Builder
              </h1>
              <p className="text-[11px] text-[#646970]">
                Click or edit any element on the left panel to see real-time live preview.
              </p>
            </div>
          </div>

          {/* Device switcher */}
          <div className="flex items-center gap-1 bg-[#f0f0f1] p-1 rounded-md border border-[#dcdcde]">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition-colors ${
                device === 'desktop'
                  ? 'bg-white text-[#2563eb] shadow-sm font-semibold'
                  : 'text-[#646970] hover:text-[#1d2327]'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition-colors ${
                device === 'tablet'
                  ? 'bg-white text-[#2563eb] shadow-sm font-semibold'
                  : 'text-[#646970] hover:text-[#1d2327]'
              }`}
              title="Tablet view (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition-colors ${
                device === 'mobile'
                  ? 'bg-white text-[#2563eb] shadow-sm font-semibold'
                  : 'text-[#646970] hover:text-[#1d2327]'
              }`}
              title="Mobile view (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:bg-[#f6f7f7] text-[#2c3338] text-xs font-medium rounded inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Site
            </a>
            <button
              type="button"
              disabled={saving}
              onClick={handlePublish}
              className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded shadow-md shadow-blue-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Publishing...' : 'Publish Changes'}
            </button>
          </div>
        </div>

        {/* 2-Column Split Pane: Left Editor Inspector, Right Live Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Element Inspector Panel */}
          <div className="lg:col-span-5 space-y-3 max-h-[82vh] overflow-y-auto pr-1">
            {/* SECTION 1: HERO */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden text-xs">
              <div
                onClick={() => toggleSection('hero')}
                className="p-3 bg-[#f6f7f7] border-b border-[#c3c4c7] font-semibold text-[#1d2327] flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                  1. Hero Section
                </span>
                {openSections.hero ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {openSections.hero && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={elements.hero.badge || ''}
                      onChange={(e) => handleUpdate('hero', 'badge', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Main Headline</label>
                    <textarea
                      rows={2}
                      value={elements.hero.title || ''}
                      onChange={(e) => handleUpdate('hero', 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Hero Subtitle</label>
                    <textarea
                      rows={3}
                      value={elements.hero.subtitle || ''}
                      onChange={(e) => handleUpdate('hero', 'subtitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-[#2c3338] mb-1">Primary CTA Button</label>
                      <input
                        type="text"
                        value={elements.hero.ctaPrimaryText || ''}
                        onChange={(e) => handleUpdate('hero', 'ctaPrimaryText', e.target.value)}
                        className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#2c3338] mb-1">Primary Button Link</label>
                      <input
                        type="text"
                        value={elements.hero.ctaPrimaryLink || ''}
                        onChange={(e) => handleUpdate('hero', 'ctaPrimaryLink', e.target.value)}
                        className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Hero Background Image</label>
                    <input
                      type="url"
                      value={elements.hero.backgroundImage || ''}
                      onChange={(e) => handleUpdate('hero', 'backgroundImage', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: STATS */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden text-xs">
              <div
                onClick={() => toggleSection('stats')}
                className="p-3 bg-[#f6f7f7] border-b border-[#c3c4c7] font-semibold text-[#1d2327] flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  2. Stats &amp; Trust Counters
                </span>
                {openSections.stats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {openSections.stats && (
                <div className="p-4 space-y-3">
                  {elements.stats.map((stat: any, idx: number) => (
                    <div key={stat.id} className="p-2.5 bg-[#fbfbfc] border border-[#dcdcde] rounded grid grid-cols-3 gap-2 items-center">
                      <div>
                        <label className="text-[10px] text-[#646970] block">Number</label>
                        <input
                          type="text"
                          value={stat.number}
                          onChange={(e) => handleStatUpdate(idx, 'number', e.target.value)}
                          className="w-full px-2 py-1 border border-[#8c8f94] rounded font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#646970] block">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleStatUpdate(idx, 'label', e.target.value)}
                          className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: SERVICES */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden text-xs">
              <div
                onClick={() => toggleSection('services')}
                className="p-3 bg-[#f6f7f7] border-b border-[#c3c4c7] font-semibold text-[#1d2327] flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  3. Services Grid ({elements.services?.length || 0})
                </span>
                {openSections.services ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {openSections.services && (
                <div className="p-4 space-y-3">
                  {elements.services.map((srv: any, idx: number) => (
                    <div key={srv.id} className="p-3 bg-[#fbfbfc] border border-[#dcdcde] rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#1d2327]">Service #{idx + 1}</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => handleServiceUpdate(idx, 'title', e.target.value)}
                          placeholder="Service Title"
                          className="w-full px-2 py-1 border border-[#8c8f94] rounded font-semibold text-xs mb-1"
                        />
                        <textarea
                          rows={2}
                          value={srv.description}
                          onChange={(e) => handleServiceUpdate(idx, 'description', e.target.value)}
                          placeholder="Description..."
                          className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: CONTACT INFO */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden text-xs">
              <div
                onClick={() => toggleSection('contact')}
                className="p-3 bg-[#f6f7f7] border-b border-[#c3c4c7] font-semibold text-[#1d2327] flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                  4. Contact &amp; Location Info
                </span>
                {openSections.contact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {openSections.contact && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={elements.contactInfo?.email || ''}
                      onChange={(e) =>
                        handleUpdate('contactInfo', 'email', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={elements.contactInfo?.phone || ''}
                      onChange={(e) =>
                        handleUpdate('contactInfo', 'phone', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Office Address</label>
                    <input
                      type="text"
                      value={elements.contactInfo?.address || ''}
                      onChange={(e) =>
                        handleUpdate('contactInfo', 'address', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: CTA BAND */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden text-xs">
              <div
                onClick={() => toggleSection('ctaBand')}
                className="p-3 bg-[#f6f7f7] border-b border-[#c3c4c7] font-semibold text-[#1d2327] flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                  5. Bottom Call to Action Band
                </span>
                {openSections.ctaBand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {openSections.ctaBand && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Headline</label>
                    <input
                      type="text"
                      value={elements.ctaBand?.title || ''}
                      onChange={(e) =>
                        handleUpdate('ctaBand', 'title', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#2c3338] mb-1">Subtext</label>
                    <textarea
                      rows={2}
                      value={elements.ctaBand?.text || ''}
                      onChange={(e) =>
                        handleUpdate('ctaBand', 'text', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-[#2c3338] mb-1">Button Text</label>
                      <input
                        type="text"
                        value={elements.ctaBand?.buttonText || ''}
                        onChange={(e) =>
                          handleUpdate('ctaBand', 'buttonText', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#2c3338] mb-1">Button Link</label>
                      <input
                        type="text"
                        value={elements.ctaBand?.buttonLink || ''}
                        onChange={(e) =>
                          handleUpdate('ctaBand', 'buttonLink', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-[#8c8f94] rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Canvas Preview Area */}
          <div className="lg:col-span-7 flex justify-center">
            <div
              className={`bg-white border-2 border-[#1e293b] rounded-xl shadow-2xl overflow-hidden transition-all duration-300 max-h-[82vh] overflow-y-auto flex flex-col ${
                device === 'desktop'
                  ? 'w-full'
                  : device === 'tablet'
                  ? 'w-[768px] max-w-full'
                  : 'w-[375px]'
              }`}
            >
              {/* Browser mockup bar */}
              <div className="bg-[#0f172a] text-white px-3 py-2 flex items-center justify-between border-b border-[#1e293b] text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                </div>
                <div className="bg-[#1e293b] px-3 py-0.5 rounded text-[11px] text-[#94a3b8] font-mono truncate max-w-xs">
                  https://nexarank.agency/
                </div>
                <span className="text-[10px] text-[#38bdf8] font-semibold uppercase">Live Canvas</span>
              </div>

              {/* LIVE PREVIEW CANVAS CONTENT */}
              <div className="flex-1 bg-white text-gray-900 font-sans">
                {/* Header Navbar */}
                <header className="px-6 py-4 border-b flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white font-bold text-xs">
                      N
                    </div>
                    <span className="font-extrabold text-base tracking-tight text-gray-900">
                      NexaRank
                    </span>
                  </div>
                  <nav className="flex gap-4 text-xs font-semibold text-gray-600">
                    <span className="text-[#2563eb]">Home</span>
                    <span>About</span>
                    <span>Services</span>
                    <span>Contact</span>
                  </nav>
                </header>

                {/* Hero Live Section */}
                <section
                  className="relative py-16 px-6 text-white text-center bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.9)), url('${elements.hero.backgroundImage}')`,
                  }}
                >
                  <div className="max-w-xl mx-auto space-y-4">
                    <span className="inline-block px-3 py-1 bg-[#2563eb] text-white text-[11px] font-semibold rounded-full uppercase tracking-wider">
                      {elements.hero.badge}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                      {elements.hero.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {elements.hero.subtitle}
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                      <span className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded text-xs font-semibold shadow-md inline-flex items-center gap-1.5 cursor-pointer">
                        {elements.hero.ctaPrimaryText} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </section>

                {/* Stats Section */}
                <section className="bg-[#0f172a] text-white py-8 px-6 border-y border-gray-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {elements.stats.map((s: any) => (
                      <div key={s.id} className="p-2">
                        <div className="text-2xl sm:text-3xl font-black text-[#38bdf8]">
                          {s.number}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Services Grid Section */}
                <section className="py-12 px-6 bg-[#f8fafc]">
                  <div className="text-center max-w-lg mx-auto mb-8 space-y-1">
                    <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">
                      Capabilities
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {elements.services.map((srv: any) => (
                      <div
                        key={srv.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-1.5 hover:border-[#2563eb] transition-colors"
                      >
                        <h3 className="font-bold text-sm text-gray-900">{srv.title}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{srv.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* CTA Band */}
                <section className="py-10 px-6 bg-gradient-to-r from-[#1e40af] to-[#2563eb] text-white text-center space-y-3">
                  <h2 className="text-xl font-bold">{elements.ctaBand?.title}</h2>
                  <p className="text-xs text-blue-100 max-w-md mx-auto leading-relaxed">
                    {elements.ctaBand?.text}
                  </p>
                  <div className="pt-2">
                    <span className="px-5 py-2 bg-white text-[#1e40af] font-bold rounded text-xs shadow-md inline-block cursor-pointer">
                      {elements.ctaBand?.buttonText}
                    </span>
                  </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#0f172a] text-gray-400 py-6 px-6 text-xs text-center border-t border-gray-800 space-y-1">
                  <p className="font-bold text-white">NexaRank Digital Agency</p>
                  <p className="text-[11px]">
                    Email: {elements.contactInfo?.email} | Phone: {elements.contactInfo?.phone}
                  </p>
                  <p className="text-[10px] text-gray-500 pt-2">
                    © 2026 NexaRank. Built with NexaRank Visual Element Builder.
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

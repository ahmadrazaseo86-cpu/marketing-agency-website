'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function ScreenOptionsHelp() {
  const [activeTab, setActiveTab] = useState<'screen' | 'help' | null>(null);

  const toggleTab = (tab: 'screen' | 'help') => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="relative mb-3">
      {/* Tab Buttons */}
      <div className="flex justify-end gap-1">
        <button
          onClick={() => toggleTab('screen')}
          className={`px-3 py-1 text-xs border border-t-0 rounded-b transition-colors flex items-center gap-1 ${
            activeTab === 'screen'
              ? 'bg-white border-[#c3c4c7] text-[#2271b1] font-medium'
              : 'bg-[#f0f0f1] border-[#c3c4c7] text-[#50575e] hover:bg-white hover:text-[#2271b1]'
          }`}
        >
          <span>Screen Options</span>
          {activeTab === 'screen' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={() => toggleTab('help')}
          className={`px-3 py-1 text-xs border border-t-0 rounded-b transition-colors flex items-center gap-1 ${
            activeTab === 'help'
              ? 'bg-white border-[#c3c4c7] text-[#2271b1] font-medium'
              : 'bg-[#f0f0f1] border-[#c3c4c7] text-[#50575e] hover:bg-white hover:text-[#2271b1]'
          }`}
        >
          <span>Help</span>
          {activeTab === 'help' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Screen Options Panel */}
      {activeTab === 'screen' && (
        <div className="bg-white border border-[#c3c4c7] p-4 text-xs shadow-sm mb-4 rounded-b animate-in fade-in duration-150">
          <div className="font-semibold text-sm mb-2 text-[#1d2327]">Show on screen</div>
          <div className="flex flex-wrap gap-4 text-[#2c3338]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2271b1]" />
              <span>Welcome</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2271b1]" />
              <span>At a Glance</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2271b1]" />
              <span>Quick Draft</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2271b1]" />
              <span>Activity</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2271b1]" />
              <span>Site Health</span>
            </label>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {activeTab === 'help' && (
        <div className="bg-white border border-[#c3c4c7] p-4 text-xs shadow-sm mb-4 rounded-b animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-[#1d2327] mb-1">Overview</h4>
              <p className="text-[#646970] leading-relaxed">
                Welcome to your WordPress administration dashboard. From here you can manage posts, pages, categories, media uploads, comments, themes, and system settings.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#1d2327] mb-1">Navigation</h4>
              <p className="text-[#646970] leading-relaxed">
                The left sidebar gives you direct access to all content and configuration modules. The top bar provides immediate shortcuts to create new posts or visit the public website.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#1d2327] mb-1">Documentation</h4>
              <ul className="text-[#2271b1] space-y-1">
                <li><a href="#" className="hover:underline">Documentation on Dashboard</a></li>
                <li><a href="#" className="hover:underline">Support Forums</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

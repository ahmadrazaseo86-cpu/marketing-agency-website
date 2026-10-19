'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Pin,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Palette,
  Plug,
  Users,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { hasCapability } from '@/lib/auth';

interface SidebarProps {
  userRole?: string;
  pendingCommentsCount?: number;
}

export default function Sidebar({ userRole = 'ADMINISTRATOR', pendingCommentsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/wp-admin',
      icon: LayoutDashboard,
      capability: 'read',
      submenus: [
        { label: 'Home', href: '/wp-admin' },
        { label: 'Site Health', href: '/wp-admin/tools' },
      ],
    },
    {
      id: 'builder',
      label: 'Visual Builder',
      href: '/wp-admin/builder',
      icon: Sparkles,
      capability: 'edit_pages',
      badge: 'PRO',
      submenus: [
        { label: 'Element Editor', href: '/wp-admin/builder' },
        { label: 'Hero Section', href: '/wp-admin/builder?section=hero' },
        { label: 'Services Grid', href: '/wp-admin/builder?section=services' },
        { label: 'Stats Counters', href: '/wp-admin/builder?section=stats' },
        { label: 'Testimonials', href: '/wp-admin/builder?section=testimonials' },
        { label: 'Contact Details', href: '/wp-admin/builder?section=contact' },
      ],
    },
    {
      id: 'seo',
      label: 'SEO Dashboard',
      href: '/wp-admin/seo',
      icon: TrendingUp,
      capability: 'manage_options',
      badge: 'AI',
      submenus: [
        { label: 'SEO Overview', href: '/wp-admin/seo' },
        { label: 'Focus Keywords', href: '/wp-admin/seo?tab=keywords' },
        { label: 'On-Page Audit', href: '/wp-admin/seo?tab=audit' },
        { label: 'XML Sitemap & Robots', href: '/wp-admin/seo?tab=sitemap' },
      ],
    },
    {
      id: 'posts',
      label: 'Posts',
      href: '/wp-admin/posts',
      icon: Pin,
      capability: 'edit_posts',
      submenus: [
        { label: 'All Posts', href: '/wp-admin/posts' },
        { label: 'Add New Post', href: '/wp-admin/posts/new' },
        { label: 'Categories', href: '/wp-admin/posts/categories' },
        { label: 'Tags', href: '/wp-admin/posts/tags' },
      ],
    },
    {
      id: 'pages',
      label: 'Pages',
      href: '/wp-admin/pages',
      icon: FileText,
      capability: 'edit_pages',
      submenus: [
        { label: 'All Pages', href: '/wp-admin/pages' },
        { label: 'Add New Page', href: '/wp-admin/pages/new' },
      ],
    },
    {
      id: 'media',
      label: 'Media',
      href: '/wp-admin/media',
      icon: ImageIcon,
      capability: 'upload_files',
      submenus: [
        { label: 'Library', href: '/wp-admin/media' },
        { label: 'Add New', href: '/wp-admin/media' },
      ],
    },
    {
      id: 'comments',
      label: 'Comments',
      href: '/wp-admin/comments',
      icon: MessageSquare,
      capability: 'manage_comments',
      badge: pendingCommentsCount > 0 ? pendingCommentsCount : null,
      submenus: [],
    },
    {
      id: 'appearance',
      label: 'Appearance',
      href: '/wp-admin/themes',
      icon: Palette,
      capability: 'switch_themes',
      submenus: [
        { label: 'Themes', href: '/wp-admin/themes' },
        { label: 'Menus', href: '/wp-admin/appearance/menus' },
      ],
    },
    {
      id: 'plugins',
      label: 'Plugins',
      href: '/wp-admin/plugins',
      icon: Plug,
      capability: 'manage_plugins',
      submenus: [
        { label: 'Installed Plugins', href: '/wp-admin/plugins' },
      ],
    },
    {
      id: 'users',
      label: 'Users',
      href: '/wp-admin/users',
      icon: Users,
      capability: 'manage_users',
      submenus: [
        { label: 'All Users', href: '/wp-admin/users' },
        { label: 'Add New User', href: '/wp-admin/users/new' },
        { label: 'Profile', href: '/wp-admin/profile' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      href: '/wp-admin/tools',
      icon: Wrench,
      capability: 'export_tools',
      submenus: [
        { label: 'Site Health', href: '/wp-admin/tools' },
        { label: 'Export Backup', href: '/wp-admin/tools' },
        { label: 'Import Backup', href: '/wp-admin/tools' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/wp-admin/settings',
      icon: Settings,
      capability: 'manage_options',
      submenus: [
        { label: 'General', href: '/wp-admin/settings' },
        { label: 'Writing', href: '/wp-admin/settings' },
        { label: 'Reading', href: '/wp-admin/settings' },
        { label: 'Discussion', href: '/wp-admin/settings' },
        { label: 'Media', href: '/wp-admin/settings' },
        { label: 'Permalinks', href: '/wp-admin/settings' },
      ],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    hasCapability(userRole, item.capability)
  );

  return (
    <aside
      className={`fixed top-8 left-0 bottom-0 z-40 bg-[#0f172a] select-none transition-all duration-200 flex flex-col border-r border-[#1e293b] ${
        collapsed ? 'w-12' : 'w-48'
      }`}
    >
      {/* Brand header */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white font-black text-xs shadow-sm">
              N
            </div>
            <div>
              <span className="font-bold text-white text-xs tracking-wider block">NexaRank</span>
              <span className="text-[10px] text-[#64748b] block -mt-0.5">CMS Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-10">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/wp-admin'
                ? pathname === '/wp-admin'
                : pathname.startsWith(item.href);

            const isHovered = hoveredMenu === item.id;

            return (
              <li
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredMenu(item.id)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-normal transition-colors relative ${
                    isActive
                      ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                      : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#38bdf8]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {item.badge && !collapsed && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        typeof item.badge === 'number'
                          ? 'bg-[#ef4444] text-white'
                          : item.badge === 'AI'
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#f0f0f1]" />
                  )}
                </Link>

                {/* Submenu on Hover or Active */}
                {!collapsed && isActive && item.submenus.length > 0 && (
                  <ul className="bg-[#0b1120] py-1 border-l-2 border-[#2563eb]">
                    {item.submenus.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={`block pl-9 pr-3 py-1.5 text-[12px] truncate transition-colors ${
                              isSubActive
                                ? 'text-white font-bold'
                                : 'text-[#94a3b8] hover:text-[#38bdf8]'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Flyout Submenu when Collapsed */}
                {collapsed && isHovered && (
                  <div className="absolute left-12 top-0 bg-[#1e293b] text-white shadow-xl min-w-[170px] py-2 z-50 rounded-r border-l border-[#334155]">
                    <div className="px-3 py-1 font-bold text-xs border-b border-[#334155] text-[#38bdf8] mb-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && <span className="text-[9px]">{item.badge}</span>}
                    </div>
                    {item.submenus.length > 0 ? (
                      item.submenus.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-3 py-1.5 text-xs text-[#94a3b8] hover:bg-[#2563eb] hover:text-white"
                        >
                          {sub.label}
                        </Link>
                      ))
                    ) : (
                      <Link
                        href={item.href}
                        className="block px-3 py-1.5 text-xs text-[#94a3b8] hover:bg-[#2563eb] hover:text-white"
                      >
                        Open {item.label}
                      </Link>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-9 border-t border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#1e293b] transition-colors"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <ChevronLeft className="w-4 h-4" />
            <span>Collapse menu</span>
          </div>
        )}
      </button>
    </aside>
  );
}

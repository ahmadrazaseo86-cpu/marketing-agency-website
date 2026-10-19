'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import {
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  Save,
  Menu as MenuIcon,
  Link as LinkIcon,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: string; // 'page', 'custom', 'category'
}

interface MenuData {
  id: string;
  name: string;
  location?: string | null;
  items: string; // JSON
}

export default function MenusPage() {
  const { addToast } = useToast();
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [menuName, setMenuName] = useState('');
  const [menuLocation, setMenuLocation] = useState('header');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Available sources to add
  const [pages, setPages] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Checkboxes for add
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState('https://');
  const [customLabel, setCustomLabel] = useState('');

  // Open item in menu structure
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [menusRes, pagesRes, catsRes] = await Promise.all([
        fetch('/api/menus').then((r) => r.json()),
        fetch('/api/pages').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      const fetchedMenus = menusRes.menus || [];
      setMenus(fetchedMenus);
      setPages(pagesRes.pages || []);
      setCategories(catsRes.categories || []);

      if (fetchedMenus.length > 0) {
        loadMenu(fetchedMenus[0]);
      }
    } catch {
      addToast('Error loading menu data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const loadMenu = (menu: MenuData) => {
    setSelectedMenuId(menu.id);
    setMenuName(menu.name);
    setMenuLocation(menu.location || 'header');
    try {
      const parsed = JSON.parse(menu.items || '[]');
      setMenuItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMenuItems([]);
    }
  };

  const handleSelectMenuChange = (id: string) => {
    const found = menus.find((m) => m.id === id);
    if (found) loadMenu(found);
  };

  const handleCreateNewMenu = async () => {
    const name = prompt('Enter a name for the new menu:', 'Footer Navigation');
    if (!name?.trim()) return;

    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: 'footer',
          items: [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Menu "${data.menu.name}" created!`, 'success');
        setMenus([...menus, data.menu]);
        loadMenu(data.menu);
      }
    } catch {
      addToast('Failed to create menu', 'error');
    }
  };

  const addPagesToMenu = () => {
    const newItems: MenuItem[] = selectedPageIds
      .map((id) => {
        const p = pages.find((page) => page.id === id);
        if (!p) return null;
        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          label: p.title,
          url: `/page/${p.slug}`,
          type: 'Page',
        };
      })
      .filter(Boolean) as MenuItem[];

    setMenuItems([...menuItems, ...newItems]);
    setSelectedPageIds([]);
    addToast(`Added ${newItems.length} pages to menu.`, 'info');
  };

  const addCustomLinkToMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim() || !customUrl.trim()) return;

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: customLabel.trim(),
      url: customUrl.trim(),
      type: 'Custom Link',
    };

    setMenuItems([...menuItems, newItem]);
    setCustomLabel('');
    setCustomUrl('https://');
    addToast('Added custom link to menu.', 'info');
  };

  const addCategoriesToMenu = () => {
    const newItems: MenuItem[] = selectedCatIds
      .map((id) => {
        const c = categories.find((cat) => cat.id === id);
        if (!c) return null;
        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          label: c.name,
          url: `/category/${c.slug}`,
          type: 'Category',
        };
      })
      .filter(Boolean) as MenuItem[];

    setMenuItems([...menuItems, ...newItems]);
    setSelectedCatIds([]);
    addToast(`Added ${newItems.length} categories to menu.`, 'info');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === menuItems.length - 1)
    ) {
      return;
    }
    const updated = [...menuItems];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setMenuItems(updated);
  };

  const removeItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const updateItemLabel = (id: string, newLabel: string) => {
    setMenuItems(
      menuItems.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const updateItemUrl = (id: string, newUrl: string) => {
    setMenuItems(
      menuItems.map((item) => (item.id === id ? { ...item, url: newUrl } : item))
    );
  };

  const handleSaveMenu = async () => {
    if (!selectedMenuId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMenuId,
          name: menuName,
          location: menuLocation,
          items: menuItems,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Menu "${menuName}" saved successfully!`, 'success');
        setMenus(menus.map((m) => (m.id === selectedMenuId ? data.menu : m)));
      } else {
        addToast(data.error || 'Failed to save menu', 'error');
      }
    } catch {
      addToast('Error saving menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Menus">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Menus</h1>
        </div>

        {/* Menu Selector Bar */}
        <div className="p-3 bg-[#f0f0f1] border border-[#c3c4c7] rounded flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#2c3338]">Select a menu to edit:</span>
          <select
            value={selectedMenuId}
            onChange={(e) => handleSelectMenuChange(e.target.value)}
            className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#2c3338]"
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.location ? `(${m.location})` : ''}
              </option>
            ))}
          </select>
          <span className="text-[#646970]">or</span>
          <button
            type="button"
            onClick={handleCreateNewMenu}
            className="text-[#2271b1] hover:underline font-semibold"
          >
            create a new menu
          </button>
        </div>

        {/* Main 2-Column Menu Editor Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Add Menu Items */}
          <div className="md:col-span-4 space-y-3 text-xs">
            {/* Pages Accordion */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-[#f6f7f7] font-semibold text-[#1d2327] border-b border-[#c3c4c7]">
                Pages
              </div>
              <div className="p-3 space-y-2">
                <div className="max-h-36 overflow-y-auto space-y-1 border border-[#dcdcde] p-2 rounded">
                  {pages.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPageIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPageIds([...selectedPageIds, p.id]);
                          else setSelectedPageIds(selectedPageIds.filter((id) => id !== p.id));
                        }}
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>{p.title}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={selectedPageIds.length === 0}
                    onClick={addPagesToMenu}
                    className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1] disabled:opacity-50"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Links Accordion */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-[#f6f7f7] font-semibold text-[#1d2327] border-b border-[#c3c4c7]">
                Custom Links
              </div>
              <form onSubmit={addCustomLinkToMenu} className="p-3 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#646970] mb-0.5">
                    URL
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#646970] mb-0.5">
                    Link Text
                  </label>
                  <input
                    type="text"
                    placeholder="Menu item label"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs"
                  />
                </div>
                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1]"
                  >
                    Add to Menu
                  </button>
                </div>
              </form>
            </div>

            {/* Categories Accordion */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-[#f6f7f7] font-semibold text-[#1d2327] border-b border-[#c3c4c7]">
                Categories
              </div>
              <div className="p-3 space-y-2">
                <div className="max-h-36 overflow-y-auto space-y-1 border border-[#dcdcde] p-2 rounded">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCatIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCatIds([...selectedCatIds, c.id]);
                          else setSelectedCatIds(selectedCatIds.filter((id) => id !== c.id));
                        }}
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={selectedCatIds.length === 0}
                    onClick={addCategoriesToMenu}
                    className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1] disabled:opacity-50"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Menu Structure & Settings */}
          <div className="md:col-span-8 bg-white border border-[#c3c4c7] rounded shadow-sm flex flex-col text-xs">
            {/* Menu Name Header Bar */}
            <div className="p-3.5 bg-[#f6f7f7] border-b border-[#c3c4c7] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-[#2c3338]">Menu Name</label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="px-2.5 py-1 border border-[#8c8f94] rounded bg-white text-xs outline-none focus:border-[#2271b1]"
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveMenu}
                className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Menu'}
              </button>
            </div>

            {/* Menu Items Structure List */}
            <div className="p-4 flex-1 space-y-2">
              <h3 className="font-semibold text-[#1d2327]">Menu Structure</h3>
              <p className="text-[11px] text-[#646970] mb-3">
                Drag or use the up/down arrows to reorder each menu item. Click the arrow on the
                right of the item to reveal additional configuration options.
              </p>

              {menuItems.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-[#dcdcde] rounded text-center text-[#646970]">
                  Add menu items from the column on the left.
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-[#c3c4c7] rounded bg-[#f6f7f7] overflow-hidden"
                    >
                      <div className="p-2.5 flex items-center justify-between bg-white select-none">
                        <div className="flex items-center gap-2 font-semibold text-[#1d2327]">
                          <MenuIcon className="w-3.5 h-3.5 text-[#8c8f94]" />
                          <span>{item.label}</span>
                          <span className="text-[10px] uppercase font-normal text-[#646970] bg-[#f0f0f1] px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 hover:bg-[#f0f0f1] rounded text-[#646970] disabled:opacity-20"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === menuItems.length - 1}
                            title="Move Down"
                            className="p-1 hover:bg-[#f0f0f1] rounded text-[#646970] disabled:opacity-20"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId(
                                expandedItemId === item.id ? null : item.id
                              )
                            }
                            title="Toggle Options"
                            className="p-1 hover:bg-[#f0f0f1] rounded text-[#646970]"
                          >
                            {expandedItemId === item.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Item Settings */}
                      {expandedItemId === item.id && (
                        <div className="p-3 bg-[#fbfbfc] border-t border-[#dcdcde] space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-0.5">
                              Navigation Label
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItemLabel(item.id, e.target.value)}
                              className="w-full px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-0.5">
                              URL
                            </label>
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => updateItemUrl(item.id, e.target.value)}
                              className="w-full px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs font-mono"
                            />
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[#b32d2e] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Settings Bar */}
            <div className="p-4 bg-[#fbfbfc] border-t border-[#dcdcde] space-y-3">
              <h3 className="font-semibold text-[#1d2327]">Menu Settings</h3>
              <div className="space-y-1.5">
                <span className="font-medium text-[#2c3338] block">Display location:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuLocation"
                    checked={menuLocation === 'header'}
                    onChange={() => setMenuLocation('header')}
                    className="text-[#2271b1]"
                  />
                  <span>Primary Menu (Header top navigation)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuLocation"
                    checked={menuLocation === 'footer'}
                    onChange={() => setMenuLocation('footer')}
                    className="text-[#2271b1]"
                  />
                  <span>Footer Menu (Footer link bar)</span>
                </label>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-3 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveMenu}
                className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Menu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

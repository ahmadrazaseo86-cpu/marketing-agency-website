'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Shield, User as UserIcon } from 'lucide-react';

interface UserListItem {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: { posts: number };
}

export default function UsersListPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    administrator: 0,
    editor: 0,
    author: 0,
    contributor: 0,
    subscriber: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [changeRoleTo, setChangeRoleTo] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentRole !== 'ALL') q.set('role', currentRole);
      if (search) q.set('search', search);

      const res = await fetch(`/api/users?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        if (data.counts) setCounts(data.counts);
      } else {
        addToast(data.error || 'Failed to fetch users', 'error');
      }
    } catch {
      addToast('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentRole]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast(`User "${username}" deleted.`, 'success');
        fetchUsers();
      } else {
        addToast(data.error || 'Failed to delete user', 'error');
      }
    } catch {
      addToast('Error deleting user', 'error');
    }
  };

  const handleBulkChangeRole = async () => {
    if (!changeRoleTo || selectedIds.length === 0) return;

    for (const id of selectedIds) {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: changeRoleTo }),
      });
    }

    addToast(`Role changed for ${selectedIds.length} users.`, 'success');
    setSelectedIds([]);
    setChangeRoleTo('');
    fetchUsers();
  };

  return (
    <AdminLayout title="Users">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-[#1d2327]">Users</h1>
            <Link
              href="/wp-admin/users/new"
              className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers();
            }}
            className="flex items-center gap-1"
          >
            <input
              type="search"
              placeholder="Search Users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#8c8f94] rounded bg-white text-[#2c3338] outline-none focus:border-[#2271b1]"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338]"
            >
              Search Users
            </button>
          </form>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#646970] border-b border-[#dcdcde] pb-2">
          <button
            type="button"
            onClick={() => setCurrentRole('ALL')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'ALL' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            All <span className="text-[#8c8f94]">({counts.all})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentRole('ADMINISTRATOR')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'ADMINISTRATOR' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Administrator <span className="text-[#8c8f94]">({counts.administrator})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentRole('EDITOR')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'EDITOR' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Editor <span className="text-[#8c8f94]">({counts.editor})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentRole('AUTHOR')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'AUTHOR' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Author <span className="text-[#8c8f94]">({counts.author})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentRole('CONTRIBUTOR')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'CONTRIBUTOR' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Contributor <span className="text-[#8c8f94]">({counts.contributor})</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setCurrentRole('SUBSCRIBER')}
            className={`hover:text-[#2271b1] ${
              currentRole === 'SUBSCRIBER' ? 'font-bold text-[#1d2327]' : ''
            }`}
          >
            Subscriber <span className="text-[#8c8f94]">({counts.subscriber})</span>
          </button>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={changeRoleTo}
              onChange={(e) => setChangeRoleTo(e.target.value)}
              className="px-2 py-1 border border-[#8c8f94] rounded bg-white text-xs text-[#2c3338]"
            >
              <option value="">Change role to…</option>
              <option value="ADMINISTRATOR">Administrator</option>
              <option value="EDITOR">Editor</option>
              <option value="AUTHOR">Author</option>
              <option value="CONTRIBUTOR">Contributor</option>
              <option value="SUBSCRIBER">Subscriber</option>
            </select>
            <button
              type="button"
              onClick={handleBulkChangeRole}
              disabled={selectedIds.length === 0 || !changeRoleTo}
              className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2c3338] disabled:opacity-50"
            >
              Change
            </button>
          </div>

          <div className="text-[#646970]">
            <span>{users.length} users</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f7f7] text-[#2c3338] border-b border-[#c3c4c7] font-semibold">
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#8c8f94] text-[#2271b1]"
                  />
                </th>
                <th className="p-2.5">Username</th>
                <th className="p-2.5 w-48">Name</th>
                <th className="p-2.5 w-56">Email</th>
                <th className="p-2.5 w-32">Role</th>
                <th className="p-2.5 text-center w-20">Posts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcdcde]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#646970]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#646970]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f6f7f7] group transition-colors">
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => handleSelectOne(u.id)}
                        className="rounded border-[#8c8f94] text-[#2271b1]"
                      />
                    </td>

                    <td className="p-2.5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1d2327] text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {u.displayName[0] || u.username[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#1d2327]">
                            <Link
                              href={`/wp-admin/users/${u.id}`}
                              className="hover:text-[#2271b1]"
                            >
                              {u.username}
                            </Link>
                          </div>
                          {/* Row Actions */}
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#646970]">
                            <Link
                              href={`/wp-admin/users/${u.id}`}
                              className="text-[#2271b1] hover:underline"
                            >
                              Edit
                            </Link>
                            <span>|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="text-[#b32d2e] hover:underline"
                            >
                              Delete
                            </button>
                            <span>|</span>
                            <Link
                              href={`/author/${u.username}`}
                              className="text-[#2271b1] hover:underline"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-2.5 text-[#2c3338]">
                      {u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}
                    </td>

                    <td className="p-2.5 text-[#2271b1] hover:underline">
                      <a href={`mailto:${u.email}`}>{u.email}</a>
                    </td>

                    <td className="p-2.5 text-[#50575e] capitalize">
                      <span className="inline-flex items-center gap-1">
                        {u.role === 'ADMINISTRATOR' && (
                          <Shield className="w-3 h-3 text-[#2271b1]" />
                        )}
                        {u.role.toLowerCase()}
                      </span>
                    </td>

                    <td className="p-2.5 text-center font-semibold text-[#2271b1]">
                      {u._count?.posts || 0}
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

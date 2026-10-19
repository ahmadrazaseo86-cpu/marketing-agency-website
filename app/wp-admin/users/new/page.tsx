'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { UserPlus, Key } from 'lucide-react';

export default function AddNewUserPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SUBSCRIBER');
  const [submitting, setSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      addToast('Username, Email, and Password are required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          firstName,
          lastName,
          website,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`User "${data.user.username}" created successfully!`, 'success');
        router.push('/wp-admin/users');
      } else {
        addToast(data.error || 'Failed to create user', 'error');
      }
    } catch {
      addToast('Error creating user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add New User">
      <div className="max-w-4xl space-y-4">
        <div>
          <h1 className="text-2xl font-normal text-[#1d2327]">Add New User</h1>
          <p className="text-xs text-[#646970] mt-1">
            Create a brand new user and add them to this site.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 border border-[#c3c4c7] rounded shadow-sm space-y-6 text-xs"
        >
          {/* Username */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">
              Username <span className="text-[#d63638]">(required)</span>
            </label>
            <div className="md:col-span-3">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">
              Email <span className="text-[#d63638]">(required)</span>
            </label>
            <div className="md:col-span-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* First Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">First Name</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Last Name</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* Website */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Website</label>
            <div className="md:col-span-3">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">
              Password <span className="text-[#d63638]">(required)</span>
            </label>
            <div className="md:col-span-3 flex items-center gap-2 max-w-md">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1] font-mono"
                placeholder="Strong password"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#e2e4e7] border border-[#c3c4c7] rounded font-semibold text-[#2271b1] inline-flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" /> Generate
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Role</label>
            <div className="md:col-span-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full max-w-xs px-2.5 py-1.5 border border-[#8c8f94] rounded bg-white text-xs text-[#2c3338]"
              >
                <option value="SUBSCRIBER">Subscriber</option>
                <option value="CONTRIBUTOR">Contributor</option>
                <option value="AUTHOR">Author</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#dcdcde] flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {submitting ? 'Creating...' : 'Add New User'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/wp-admin/users')}
              className="px-4 py-2 bg-white border border-[#c3c4c7] hover:bg-[#f6f7f7] text-[#2c3338] rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

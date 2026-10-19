'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Save, Key, Shield } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  bio?: string | null;
  website?: string | null;
  avatarUrl?: string | null;
}

interface UserProfileFormProps {
  userId: string;
  isSelf?: boolean;
}

export default function UserProfileForm({ userId, isSelf = false }: UserProfileFormProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('SUBSCRIBER');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          const u = data.user;
          setUsername(u.username);
          setEmail(u.email);
          setDisplayName(u.displayName || '');
          setFirstName(u.firstName || '');
          setLastName(u.lastName || '');
          setRole(u.role || 'SUBSCRIBER');
          setBio(u.bio || '');
          setWebsite(u.website || '');
        } else {
          addToast(data.error || 'User not found', 'error');
        }
      })
      .catch(() => addToast('Error loading user profile', 'error'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        email,
        displayName,
        firstName,
        lastName,
        bio,
        website,
      };

      if (!isSelf) {
        payload.role = role;
      }

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Profile updated successfully!', 'success');
        setNewPassword('');
      } else {
        addToast(data.error || 'Failed to update profile', 'error');
      }
    } catch {
      addToast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 border border-[#c3c4c7] rounded shadow-sm space-y-6 text-xs max-w-4xl"
    >
      {/* Section 1: Name */}
      <div>
        <h2 className="text-base font-semibold text-[#1d2327] pb-2 border-b border-[#dcdcde] mb-4">
          Name
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Username</label>
            <div className="md:col-span-3">
              <input
                type="text"
                disabled
                value={username}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#dcdcde] bg-[#f0f0f1] text-[#646970] rounded text-xs cursor-not-allowed"
              />
              <span className="text-[11px] text-[#646970] block mt-1">
                Usernames cannot be changed.
              </span>
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Display name publicly as</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Contact Info */}
      <div>
        <h2 className="text-base font-semibold text-[#1d2327] pb-2 border-b border-[#dcdcde] mb-4">
          Contact Info
        </h2>
        <div className="space-y-4">
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
        </div>
      </div>

      {/* Section 3: About Yourself */}
      <div>
        <h2 className="text-base font-semibold text-[#1d2327] pb-2 border-b border-[#dcdcde] mb-4">
          About Yourself
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2">
            <label className="font-semibold text-[#2c3338] pt-1">Biographical Info</label>
            <div className="md:col-span-3">
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
                placeholder="Share a little biographical information to fill out your profile."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Account Management & Role */}
      <div>
        <h2 className="text-base font-semibold text-[#1d2327] pb-2 border-b border-[#dcdcde] mb-4">
          Account Management
        </h2>
        <div className="space-y-4">
          {!isSelf && (
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
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <label className="font-semibold text-[#2c3338]">Set New Password</label>
            <div className="md:col-span-3">
              <input
                type="password"
                placeholder="Leave blank to keep existing password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full max-w-md px-2.5 py-1.5 border border-[#8c8f94] rounded text-xs outline-none focus:border-[#2271b1]"
              />
              <span className="text-[11px] text-[#646970] block mt-1">
                Must be at least 6 characters long.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[#dcdcde] flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Updating...' : isSelf ? 'Update Profile' : 'Update User'}
        </button>
      </div>
    </form>
  );
}

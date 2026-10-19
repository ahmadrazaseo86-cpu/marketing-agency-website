'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import UserProfileForm from '@/components/users/UserProfileForm';

export default function CurrentUserProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Profile">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-normal text-[#1d2327]">Profile</h1>
          <p className="text-xs text-[#646970] mt-1">
            Your profile details and personal options.
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 text-center text-[#646970] rounded border border-[#c3c4c7]">
            Loading profile...
          </div>
        ) : currentUser ? (
          <UserProfileForm userId={currentUser.id} isSelf={true} />
        ) : (
          <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
            Could not load current user session.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

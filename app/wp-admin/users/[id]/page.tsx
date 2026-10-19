'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import UserProfileForm from '@/components/users/UserProfileForm';
import { Plus } from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <AdminLayout title="Edit User">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Edit User</h1>
          <Link
            href="/wp-admin/users/new"
            className="px-2.5 py-1 text-xs font-semibold text-[#2271b1] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </Link>
        </div>

        {id && <UserProfileForm userId={id} isSelf={false} />}
      </div>
    </AdminLayout>
  );
}

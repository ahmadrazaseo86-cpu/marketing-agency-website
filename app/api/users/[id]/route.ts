import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability, hashPassword } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Users can view their own profile; only admins/editors can view other users
  if (authUser.id !== params.id && !hasCapability(authUser.role, 'list_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        website: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allowed if editing own profile or has edit_users capability
  const isSelf = authUser.id === params.id;
  const canEditOthers = hasCapability(authUser.role, 'edit_users');

  if (!isSelf && !canEditOthers) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const {
      email,
      displayName,
      firstName,
      lastName,
      role,
      bio,
      website,
      avatarUrl,
      newPassword,
    } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      displayName: displayName !== undefined ? displayName : existing.displayName,
      firstName: firstName !== undefined ? firstName : existing.firstName,
      lastName: lastName !== undefined ? lastName : existing.lastName,
      bio: bio !== undefined ? bio : existing.bio,
      website: website !== undefined ? website : existing.website,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
    };

    if (email && email !== existing.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });
      if (emailInUse) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updateData.email = email;
    }

    // Role changes can only be made by administrators
    if (role && canEditOthers && role !== existing.role) {
      updateData.role = role;
    }

    // Password change
    if (newPassword && newPassword.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword.trim());
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        website: true,
        avatarUrl: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_user',
        entityType: 'user',
        entityId: updated.id,
        details: `Updated user ${updated.username}`,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'delete_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (authUser.id === params.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own account.' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'ADMINISTRATOR') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMINISTRATOR' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only remaining Administrator.' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id: params.id } });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'deleted_user',
        entityType: 'user',
        entityId: params.id,
        details: `Deleted user ${user.username}`,
      },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

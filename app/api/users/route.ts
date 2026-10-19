import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'list_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { displayName: { contains: search } },
      ];
    }

    const [users, countAll, countAdmin, countEditor, countAuthor, countContributor, countSubscriber] =
      await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            _count: { select: { posts: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMINISTRATOR' } }),
        prisma.user.count({ where: { role: 'EDITOR' } }),
        prisma.user.count({ where: { role: 'AUTHOR' } }),
        prisma.user.count({ where: { role: 'CONTRIBUTOR' } }),
        prisma.user.count({ where: { role: 'SUBSCRIBER' } }),
      ]);

    return NextResponse.json({
      users,
      counts: {
        all: countAll,
        administrator: countAdmin,
        editor: countEditor,
        author: countAuthor,
        contributor: countContributor,
        subscriber: countSubscriber,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'create_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const {
      username,
      email,
      password,
      role = 'SUBSCRIBER',
      firstName,
      lastName,
      website,
      bio,
    } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username or email already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const displayName =
      [firstName, lastName].filter(Boolean).join(' ') || cleanUsername;

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        displayName,
        firstName: firstName || null,
        lastName: lastName || null,
        website: website || null,
        bio: bio || null,
        role: role.toUpperCase(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'created_user',
        entityType: 'user',
        entityId: user.id,
        details: `Created user ${user.username} with role ${user.role}`,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}

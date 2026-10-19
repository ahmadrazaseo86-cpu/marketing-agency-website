import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Counts
    const [
      publishedPosts,
      draftPosts,
      totalPages,
      totalComments,
      pendingComments,
      recentPosts,
      recentComments,
      recentLogs,
    ] = await Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.page.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { author: { select: { displayName: true } } },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { post: { select: { title: true, slug: true } } },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { displayName: true } } },
      }),
    ]);

    // Active Theme
    const activeTheme = await prisma.theme.findFirst({
      where: { isActive: true },
    });

    return NextResponse.json({
      counts: {
        publishedPosts,
        draftPosts,
        totalPages,
        totalComments,
        pendingComments,
      },
      recentPosts,
      recentComments,
      recentLogs,
      activeTheme: activeTheme?.name || 'Twenty Twenty-Four',
      wordpressVersion: '6.6.2',
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

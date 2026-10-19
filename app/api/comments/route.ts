import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search');

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    } else {
      where.status = { not: 'TRASH' };
    }

    if (search) {
      where.OR = [
        { authorName: { contains: search } },
        { authorEmail: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [comments, countAll, countPending, countApproved, countSpam, countTrash] =
      await Promise.all([
        prisma.comment.findMany({
          where,
          include: {
            post: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.comment.count({ where: { status: { not: 'TRASH' } } }),
        prisma.comment.count({ where: { status: 'PENDING' } }),
        prisma.comment.count({ where: { status: 'APPROVED' } }),
        prisma.comment.count({ where: { status: 'SPAM' } }),
        prisma.comment.count({ where: { status: 'TRASH' } }),
      ]);

    return NextResponse.json({
      comments,
      counts: {
        all: countAll,
        pending: countPending,
        approved: countApproved,
        spam: countSpam,
        trash: countTrash,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);

  try {
    const {
      postId,
      parentId,
      content,
      authorName,
      authorEmail,
      authorUrl,
    } = await req.json();

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        content: content.trim(),
        authorName: authUser ? authUser.displayName : authorName || 'Anonymous',
        authorEmail: authUser ? authUser.email : authorEmail || 'anon@example.com',
        authorUrl: authorUrl || null,
        status: authUser && hasCapability(authUser.role, 'moderate_comments') ? 'APPROVED' : 'PENDING',
        userId: authUser ? authUser.id : null,
      },
      include: {
        post: { select: { title: true } },
      },
    });

    if (authUser) {
      await prisma.activityLog.create({
        data: {
          userId: authUser.id,
          action: 'added_comment',
          entityType: 'comment',
          entityId: comment.id,
          details: `Commented on post "${comment.post?.title || 'Unknown'}"`,
        },
      });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to submit comment.' }, { status: 500 });
  }
}

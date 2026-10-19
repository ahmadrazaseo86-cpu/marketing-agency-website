import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    } else {
      // Exclude TRASH by default in ALL view
      where.status = { not: 'TRASH' };
    }

    if (category) {
      where.categories = { some: { slug: category } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Role restrictions: Contributors only see their own posts
    if (authUser.role === 'CONTRIBUTOR') {
      where.authorId = authUser.id;
    }

    const [posts, total, countAll, countPublished, countDraft, countScheduled, countTrash] =
      await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: { select: { id: true, displayName: true, username: true } },
            categories: true,
            tags: true,
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.post.count({ where }),
        prisma.post.count({ where: { status: { not: 'TRASH' } } }),
        prisma.post.count({ where: { status: 'PUBLISHED' } }),
        prisma.post.count({ where: { status: 'DRAFT' } }),
        prisma.post.count({ where: { status: 'SCHEDULED' } }),
        prisma.post.count({ where: { status: 'TRASH' } }),
      ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: countAll,
        published: countPublished,
        draft: countDraft,
        scheduled: countScheduled,
        trash: countTrash,
      },
    });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_posts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      status = 'DRAFT',
      visibility = 'PUBLIC',
      password,
      scheduledAt,
      featuredImage,
      metaTitle,
      metaDescription,
      focusKeyword,
      categoryIds = [],
      tagIds = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'post';
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || '',
        status,
        visibility,
        password: password || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        focusKeyword: focusKeyword || null,
        authorId: authUser.id,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
        revisions: {
          create: {
            title,
            content: content || '',
            excerpt: excerpt || '',
          },
        },
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'created_post',
        entityType: 'post',
        entityId: post.id,
        details: `Created post "${title}" (${status})`,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });
  }
}

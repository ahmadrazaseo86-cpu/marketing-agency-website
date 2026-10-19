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
    const search = searchParams.get('search');

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    } else {
      where.status = { not: 'TRASH' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [pages, countAll, countPublished, countDraft, countTrash] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          author: { select: { displayName: true } },
          parent: { select: { title: true } },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.page.count({ where: { status: { not: 'TRASH' } } }),
      prisma.page.count({ where: { status: 'PUBLISHED' } }),
      prisma.page.count({ where: { status: 'DRAFT' } }),
      prisma.page.count({ where: { status: 'TRASH' } }),
    ]);

    return NextResponse.json({
      pages,
      counts: {
        all: countAll,
        published: countPublished,
        draft: countDraft,
        trash: countTrash,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_pages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const {
      title,
      content,
      status = 'DRAFT',
      template = 'default',
      order = 0,
      parentId,
      featuredImage,
      metaTitle,
      metaDescription,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }

    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'page';
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.page.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content: content || '',
        status,
        template,
        order: parseInt(order, 10) || 0,
        parentId: parentId || null,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        authorId: authUser.id,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'created_page',
        entityType: 'page',
        entityId: page.id,
        details: `Created page "${title}" (${status})`,
      },
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json({ error: 'Failed to create page.' }, { status: 500 });
  }
}

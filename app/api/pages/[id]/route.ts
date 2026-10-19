import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, displayName: true, username: true } },
        parent: { select: { id: true, title: true } },
        children: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch page.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_pages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.page.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const {
      title,
      slug,
      content,
      status,
      template,
      order,
      parentId,
      featuredImage,
      metaTitle,
      metaDescription,
    } = body;

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const duplicate = await prisma.page.findFirst({
        where: { slug: finalSlug, id: { not: params.id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Guard against circular parent references (page cannot be parent of itself)
    let safeParentId = parentId !== undefined ? parentId : existing.parentId;
    if (safeParentId === params.id) {
      safeParentId = null;
    }

    const updated = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: finalSlug,
        content: content !== undefined ? content : existing.content,
        status: status !== undefined ? status : existing.status,
        template: template !== undefined ? template : existing.template,
        order: order !== undefined ? parseInt(order, 10) || 0 : existing.order,
        parentId: safeParentId || null,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      },
      include: {
        author: { select: { displayName: true } },
        parent: { select: { id: true, title: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_page',
        entityType: 'page',
        entityId: updated.id,
        details: `Updated page "${updated.title}" (${updated.status})`,
      },
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    console.error('Update page error:', error);
    return NextResponse.json({ error: 'Failed to update page.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'delete_pages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const page = await prisma.page.findUnique({ where: { id: params.id } });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    if (page.status === 'TRASH' || force) {
      await prisma.page.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, message: 'Page permanently deleted.' });
    } else {
      const trashed = await prisma.page.update({
        where: { id: params.id },
        data: { status: 'TRASH' },
      });
      return NextResponse.json({ success: true, message: 'Page moved to Trash.', page: trashed });
    }
  } catch (error: any) {
    console.error('Delete page error:', error);
    return NextResponse.json({ error: 'Failed to delete page.' }, { status: 500 });
  }
}

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
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, displayName: true, username: true } },
        categories: true,
        tags: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch post.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_posts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      include: { categories: true, tags: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Role check: Contributors can only edit their own drafts
    if (authUser.role === 'CONTRIBUTOR' && existing.authorId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      title,
      slug,
      content,
      excerpt,
      status,
      visibility,
      password,
      scheduledAt,
      featuredImage,
      metaTitle,
      metaDescription,
      focusKeyword,
      categoryIds,
      tagIds,
      authorId,
    } = body;

    // Check slug uniqueness if changed
    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const duplicate = await prisma.post.findFirst({
        where: { slug: finalSlug, id: { not: params.id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Disconnect old and connect new categories/tags if provided
    const updateData: any = {
      title: title !== undefined ? title : existing.title,
      slug: finalSlug,
      content: content !== undefined ? content : existing.content,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      status: status !== undefined ? status : existing.status,
      visibility: visibility !== undefined ? visibility : existing.visibility,
      password: password !== undefined ? password : existing.password,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt,
      featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
      metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      focusKeyword: focusKeyword !== undefined ? focusKeyword : existing.focusKeyword,
    };

    if (authorId && hasCapability(authUser.role, 'edit_others_posts')) {
      updateData.authorId = authorId;
    }

    if (categoryIds) {
      updateData.categories = {
        set: categoryIds.map((id: string) => ({ id })),
      };
    }

    if (tagIds) {
      updateData.tags = {
        set: tagIds.map((id: string) => ({ id })),
      };
    }

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
      include: {
        categories: true,
        tags: true,
        author: { select: { displayName: true } },
      },
    });

    // Create a revision snapshot if content or title changed
    if (
      (content !== undefined && content !== existing.content) ||
      (title !== undefined && title !== existing.title)
    ) {
      await prisma.postRevision.create({
        data: {
          postId: updated.id,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_post',
        entityType: 'post',
        entityId: updated.id,
        details: `Updated post "${updated.title}" (${updated.status})`,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'delete_posts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    if (post.status === 'TRASH' || force) {
      // Permanently Delete
      await prisma.post.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, message: 'Post permanently deleted.' });
    } else {
      // Move to Trash
      const trashed = await prisma.post.update({
        where: { id: params.id },
        data: { status: 'TRASH' },
      });
      return NextResponse.json({ success: true, message: 'Post moved to Trash.', post: trashed });
    }
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
  }
}

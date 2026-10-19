import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required for draft.' }, { status: 400 });
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const draft = await prisma.post.create({
      data: {
        title,
        slug,
        content: content ? `<p>${content.replace(/\n/g, '</p><p>')}</p>` : '',
        excerpt: content ? content.slice(0, 140) : '',
        status: 'DRAFT',
        authorId: authUser.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'created_quick_draft',
        entityType: 'post',
        entityId: draft.id,
        details: `Saved Quick Draft: "${title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      draft,
      message: 'Draft saved successfully!',
    });
  } catch (error: any) {
    console.error('Quick draft error:', error);
    return NextResponse.json({ error: 'Failed to save draft.' }, { status: 500 });
  }
}

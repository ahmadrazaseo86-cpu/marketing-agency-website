import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'moderate_comments')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { status, content } = await req.json();

    const updated = await prisma.comment.update({
      where: { id: params.id },
      data: {
        status: status !== undefined ? status : undefined,
        content: content !== undefined ? content : undefined,
      },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'moderate_comments')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: params.id } });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    if (comment.status === 'TRASH' || force) {
      await prisma.comment.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, message: 'Comment permanently deleted.' });
    } else {
      const trashed = await prisma.comment.update({
        where: { id: params.id },
        data: { status: 'TRASH' },
      });
      return NextResponse.json({ success: true, message: 'Comment moved to Trash.', comment: trashed });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

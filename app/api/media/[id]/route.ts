import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: { uploadedBy: { select: { displayName: true } } },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'upload_files')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { title, altText, caption } = await req.json();

    const updated = await prisma.media.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : undefined,
        altText: altText !== undefined ? altText : undefined,
        caption: caption !== undefined ? caption : undefined,
      },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
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
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Try deleting local file if it is in uploads directory
    if (media.url.startsWith('/uploads/')) {
      const localFilePath = path.join(process.cwd(), 'public', media.url);
      try {
        await unlink(localFilePath);
      } catch (e) {
        // file may already have been removed or missing
      }
    }

    await prisma.media.delete({ where: { id: params.id } });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'deleted_media',
        entityType: 'media',
        entityId: media.id,
        details: `Deleted media "${media.filename}"`,
      },
    });

    return NextResponse.json({ success: true, message: 'Media deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

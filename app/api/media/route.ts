import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const mimeType = searchParams.get('type');

    const where: any = {};
    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { title: { contains: search } },
        { altText: { contains: search } },
      ];
    }
    if (mimeType && mimeType !== 'all') {
      where.mimeType = { startsWith: mimeType };
    }

    const media = await prisma.media.findMany({
      where,
      include: {
        uploadedBy: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'upload_files')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const urlInput = formData.get('url') as string | null;

    let filename = '';
    let url = '';
    let mimeType = 'image/jpeg';
    let size = 0;
    let title = '';

    if (file && typeof file === 'object' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      filename = `${timestamp}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, filename);

      await writeFile(filePath, buffer);

      url = `/uploads/${filename}`;
      mimeType = file.type || 'image/jpeg';
      size = file.size;
      title = file.name.replace(/\.[^/.]+$/, '');
    } else if (urlInput) {
      // Direct URL registration (e.g. Unsplash or external link)
      url = urlInput.trim();
      const parsed = path.basename(new URL(url).pathname) || 'image.jpg';
      filename = parsed;
      title = parsed.replace(/\.[^/.]+$/, '');
      mimeType = 'image/jpeg';
      size = 125000;
    } else {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        filename,
        url,
        mimeType,
        size,
        title: title || 'Attachment',
        altText: title || '',
        caption: '',
        uploadedById: authUser.id,
      },
      include: {
        uploadedBy: { select: { displayName: true } },
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'uploaded_media',
        entityType: 'media',
        entityId: media.id,
        details: `Uploaded media "${media.filename}"`,
      },
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media.' }, { status: 500 });
  }
}

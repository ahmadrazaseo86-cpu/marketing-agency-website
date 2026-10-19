import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'export')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const content = searchParams.get('content') || 'all';

    const exportData: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    if (content === 'all' || content === 'posts') {
      exportData.posts = await prisma.post.findMany({
        include: { categories: true, tags: true },
      });
    }

    if (content === 'all' || content === 'pages') {
      exportData.pages = await prisma.page.findMany();
    }

    if (content === 'all' || content === 'comments') {
      exportData.comments = await prisma.comment.findMany();
    }

    if (content === 'all' || content === 'categories') {
      exportData.categories = await prisma.category.findMany();
      exportData.tags = await prisma.tag.findMany();
    }

    if (content === 'all' || content === 'media') {
      exportData.media = await prisma.media.findMany();
    }

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="wordpress-export-${content}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'import')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    let importedCount = 0;

    if (body.posts && Array.isArray(body.posts)) {
      for (const p of body.posts) {
        const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
        if (!existing) {
          await prisma.post.create({
            data: {
              title: p.title,
              slug: p.slug,
              content: p.content,
              excerpt: p.excerpt || null,
              status: p.status || 'DRAFT',
              authorId: authUser.id,
            },
          });
          importedCount++;
        }
      }
    }

    if (body.categories && Array.isArray(body.categories)) {
      for (const c of body.categories) {
        const existing = await prisma.category.findUnique({ where: { slug: c.slug } });
        if (!existing) {
          await prisma.category.create({
            data: {
              name: c.name,
              slug: c.slug,
              description: c.description || null,
            },
          });
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed! Imported ${importedCount} items.`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to parse or import data.' }, { status: 500 });
  }
}

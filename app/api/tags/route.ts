import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'manage_categories')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, slug, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
    }

    let tagSlug = slug ? slugify(slug) : slugify(name);
    let counter = 1;
    while (await prisma.tag.findUnique({ where: { slug: tagSlug } })) {
      tagSlug = `${tagSlug}-${counter}`;
      counter++;
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug: tagSlug,
        description: description ? description.trim() : null,
      },
    });

    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create tag.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'manage_categories')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Tag deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag.' }, { status: 500 });
  }
}

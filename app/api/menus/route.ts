import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ menus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_theme_options')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, location, items } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Menu name is required' }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        name: name.trim(),
        location: location || null,
        items: typeof items === 'string' ? items : JSON.stringify(items || []),
      },
    });

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_theme_options')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, name, location, items } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    const updated = await prisma.menu.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        location: location !== undefined ? location : undefined,
        items: items !== undefined ? (typeof items === 'string' ? items : JSON.stringify(items)) : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_menu',
        entityType: 'menu',
        entityId: updated.id,
        details: `Updated navigation menu "${updated.name}"`,
      },
    });

    return NextResponse.json({ success: true, menu: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}

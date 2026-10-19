import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [plugins, countAll, countActive, countInactive] = await Promise.all([
      prisma.plugin.findMany({ where, orderBy: { name: 'asc' } }),
      prisma.plugin.count(),
      prisma.plugin.count({ where: { isActive: true } }),
      prisma.plugin.count({ where: { isActive: false } }),
    ]);

    return NextResponse.json({
      plugins,
      counts: {
        all: countAll,
        active: countActive,
        inactive: countInactive,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'activate_plugins')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, isActive } = await req.json();

    const updated = await prisma.plugin.update({
      where: { id },
      data: { isActive },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: isActive ? 'activated_plugin' : 'deactivated_plugin',
        entityType: 'plugin',
        entityId: updated.id,
        details: `${isActive ? 'Activated' : 'Deactivated'} plugin "${updated.name}"`,
      },
    });

    return NextResponse.json({ success: true, plugin: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle plugin' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'install_plugins')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, description, version = '1.0.0', author, slug } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Plugin name and slug are required' }, { status: 400 });
    }

    const plugin = await prisma.plugin.create({
      data: {
        name,
        slug,
        description: description || '',
        version,
        author: author || 'Community',
        isActive: false,
      },
    });

    return NextResponse.json({ success: true, plugin }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to install plugin' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'delete_plugins')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.plugin.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Plugin deleted.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plugin' }, { status: 500 });
  }
}

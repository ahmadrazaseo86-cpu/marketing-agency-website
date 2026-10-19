import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const themes = await prisma.theme.findMany({
      orderBy: { isActive: 'desc' },
    });
    return NextResponse.json({ themes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'switch_themes')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { themeId } = await req.json();

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Set all themes isActive to false, then activate the chosen theme
    await prisma.theme.updateMany({
      data: { isActive: false },
    });

    const activeTheme = await prisma.theme.update({
      where: { id: themeId },
      data: { isActive: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'activated_theme',
        entityType: 'theme',
        entityId: activeTheme.id,
        details: `Activated theme "${activeTheme.name}"`,
      },
    });

    return NextResponse.json({ success: true, theme: activeTheme });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to activate theme' }, { status: 500 });
  }
}

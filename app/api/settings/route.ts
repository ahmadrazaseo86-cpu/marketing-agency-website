import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const options = await prisma.option.findMany();
    const settings: Record<string, string> = {};
    for (const opt of options) {
      settings[opt.key] = opt.value;
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'manage_options')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body: Record<string, any> = await req.json();

    const updates = Object.entries(body).map(([key, val]) => {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return prisma.option.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    });

    await prisma.$transaction(updates);

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_settings',
        entityType: 'setting',
        details: `Updated ${Object.keys(body).length} site settings`,
      },
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

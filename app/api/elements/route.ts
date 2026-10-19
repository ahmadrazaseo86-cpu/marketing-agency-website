import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasCapability } from '@/lib/auth';

import { DEFAULT_PAGE_ELEMENTS } from '@/lib/elements';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || 'home';

    const optionKey = `nexarank_elements_${page}`;
    const stored = await prisma.option.findUnique({ where: { key: optionKey } });

    if (stored) {
      try {
        const parsed = JSON.parse(stored.value);
        return NextResponse.json({ elements: parsed, page });
      } catch (e) {}
    }

    // Fallback to defaults
    const defaultData = DEFAULT_PAGE_ELEMENTS[page] || DEFAULT_PAGE_ELEMENTS.home;
    return NextResponse.json({ elements: defaultData, page });
  } catch (error) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || 'home';
    const defaultData = DEFAULT_PAGE_ELEMENTS[page] || DEFAULT_PAGE_ELEMENTS.home;
    return NextResponse.json({ elements: defaultData, page });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || !hasCapability(authUser.role, 'edit_pages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { page = 'home', elements } = await req.json();

    if (!elements) {
      return NextResponse.json({ error: 'Elements payload required' }, { status: 400 });
    }

    const optionKey = `nexarank_elements_${page}`;
    const valueString = JSON.stringify(elements);

    await prisma.option.upsert({
      where: { key: optionKey },
      update: { value: valueString },
      create: { key: optionKey, value: valueString },
    });

    await prisma.activityLog.create({
      data: {
        userId: authUser.id,
        action: 'updated_page_elements',
        entityType: 'page',
        entityId: page,
        details: `Updated visual elements for "${page}" page in NexaRank Builder`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Page elements for "${page}" published successfully!`,
      elements,
    });
  } catch (error) {
    console.error('Update elements error:', error);
    return NextResponse.json({ error: 'Failed to save elements' }, { status: 500 });
  }
}

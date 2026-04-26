import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export async function POST(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const applicationId = body.applicationId as string | undefined;
    const applicationRef = body.applicationRef as string | undefined;
    const key = applicationRef ?? applicationId;

    if (!key) {
      return NextResponse.json({ error: 'applicationRef or applicationId is required' }, { status: 400 });
    }

    const app = await prisma.admissionApplication.findFirst({
      where: {
        OR: [{ id: key }, { applicationRef: key }],
        status: 'pending',
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'Pending application not found' }, { status: 404 });
    }

    await prisma.admissionApplication.update({
      where: { id: app.id },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true, message: 'Application rejected' }, { status: 200 });
  } catch (error) {
    console.error('Admission reject error:', error);
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 });
  }
}

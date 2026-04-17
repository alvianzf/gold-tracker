import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const purpose = await prisma.financePurpose.findUnique({
      where: { id },
    });

    if (!purpose || purpose.userId !== user.id) {
      return NextResponse.json({ error: 'Purpose not found' }, { status: 404 });
    }

    await prisma.financePurpose.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting finance purpose:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

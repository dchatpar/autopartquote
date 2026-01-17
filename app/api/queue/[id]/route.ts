import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/queue/[id] - Update status
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { status, error } = await request.json();

        const updated = await prisma.part.update({
            where: { id },
            data: {
                enrichmentStatus: status,
                enrichmentError: error || null,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Queue update error:', error);
        return NextResponse.json({ error: 'Failed to update queue item' }, { status: 500 });
    }
}

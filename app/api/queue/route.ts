import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/queue - Fetch all queued items (or filtered)
export async function GET(request: NextRequest) {
    try {
        const items = await prisma.part.findMany({
            where: {
                enrichmentStatus: {
                    in: ['PENDING', 'PROCESSING', 'FAILED', 'COMPLETED'] // Show all relevant, or maybe filter completed later
                }
            },
            orderBy: [
                { enrichmentStatus: 'asc' }, // PENDING first (P < C ?) No, alphabet. PENDING, PROCESSING, FAILED, COMPLETED
                { createdAt: 'desc' }
            ],
            take: 100
        });

        // Calculate stats
        const stats = {
            pending: await prisma.part.count({ where: { enrichmentStatus: 'PENDING' } }),
            processing: await prisma.part.count({ where: { enrichmentStatus: 'PROCESSING' } }),
            completed: await prisma.part.count({ where: { enrichmentStatus: 'COMPLETED' } }),
            failed: await prisma.part.count({ where: { enrichmentStatus: 'FAILED' } }),
        };

        return NextResponse.json({ items, stats });
    } catch (error) {
        console.error('Queue fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
    }
}

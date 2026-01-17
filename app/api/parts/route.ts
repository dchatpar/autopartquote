import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Parts API with Full Enriched Data
 * Returns all parts with vehicle compatibility and AI data
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const brand = searchParams.get('brand');
        const category = searchParams.get('category');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (search) {
            where.OR = [
                { partNumber: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (brand && brand !== 'all') {
            where.brand = brand;
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        const parts = await prisma.part.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({
            success: true,
            parts,
            total: parts.length,
        });

    } catch (error) {
        console.error('Get parts error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch parts',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

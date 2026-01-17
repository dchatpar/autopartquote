import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {
            isActive: true,
        };

        if (query) {
            whereClause.OR = [
                { partNumber: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
                { oemNumbers: { has: query } },
                // JSON search is more complex, keeping it simple for now
            ];
        }

        if (category) {
            whereClause.category = {
                slug: category
            };
        }

        const [parts, total] = await Promise.all([
            prisma.masterPart.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
                include: {
                    category: true
                },
                orderBy: {
                    popularityScore: 'desc'
                }
            }),
            prisma.masterPart.count({ where: whereClause })
        ]);

        return NextResponse.json({
            success: true,
            data: parts,
            meta: {
                total,
                limit,
                offset
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Master catalog search error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.partNumber || !body.brand) {
            return NextResponse.json(
                { success: false, error: 'Validation failed' },
                { status: 400 }
            );
        }

        const part = await prisma.masterPart.create({
            data: {
                partNumber: body.partNumber,
                name: body.name || body.description || 'Unknown Part', // Fallback name
                brand: body.brand,
                description: body.description,
                specifications: body.specifications || {},
                compatibility: body.compatibility || {},
                oemNumbers: body.oemNumbers || [],
                images: body.images || [],
                // Optional category linking logic could go here
            }
        });

        return NextResponse.json({
            success: true,
            data: part
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint violation
            return NextResponse.json(
                { success: false, error: 'Part number already exists in master catalog' },
                { status: 409 }
            );
        }
        console.error('Create master part error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

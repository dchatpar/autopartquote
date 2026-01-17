import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { parts } = await request.json(); // Expecting array of { partNumber, description, ... }

        if (!Array.isArray(parts) || parts.length === 0) {
            return NextResponse.json({ error: 'Invalid parts data' }, { status: 400 });
        }

        const createdParts = [];

        for (const part of parts) {
            // Upsert part to ensure it exists and is marked as PENDING
            const upserted = await prisma.part.upsert({
                where: { partNumber: part.partNumber },
                update: {
                    // Start/Restart enrichment if needed
                    enrichmentStatus: 'PENDING',
                    // Don't overwrite existing rich data if we are just re-importing, 
                    // but status PENDING will trigger re-check.
                },
                create: {
                    partNumber: part.partNumber,
                    description: part.description || 'Unknown Part',
                    brand: part.brand || 'Generic',
                    stockQuantity: part.quantity || 0,
                    sellingPrice: part.unitPrice || 0,
                    enrichmentStatus: 'PENDING',
                }
            });
            createdParts.push(upserted);
        }

        return NextResponse.json({
            success: true,
            count: createdParts.length,
            message: `Queued ${createdParts.length} parts for enrichment`
        });

    } catch (error) {
        console.error('Batch import error:', error);
        return NextResponse.json({
            error: 'Failed to batch import',
            details: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 });
    }
}

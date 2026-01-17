import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Bulk Part Enrichment API
 * Auto-enriches parts with missing data using DeepSeek
 */

export async function POST(request: NextRequest) {
    try {
        const { partNumbers, forceRefresh } = await request.json();

        console.log(`🔄 Starting bulk enrichment for ${partNumbers?.length || 'all'} parts`);

        // Get parts to enrich
        let parts;
        if (partNumbers && partNumbers.length > 0) {
            parts = await prisma.part.findMany({
                where: { partNumber: { in: partNumbers } },
            });
        } else {
            // Get all parts that need enrichment
            // Smart Enrichment: Target parts that have never been enriched OR have missing critical data
            parts = await prisma.part.findMany({
                where: forceRefresh ? {} : {
                    OR: [
                        { lastEnriched: null },
                        {
                            // If enriched but missing vehicle data
                            AND: [
                                { lastEnriched: { not: null } },
                                { compatibleVehicles: { equals: [] } }
                            ]
                        }
                    ],
                },
                take: 50, // Limit to 50 at a time
            });
        }

        console.log(`Found ${parts.length} parts to enrich`);

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const part of parts) {
            try {
                // Call DeepSeek enrichment API
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/enrich-part`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partNumber: part.partNumber,
                        description: part.description,
                        brand: part.brand,
                    }),
                });

                const enrichmentData = await response.json();

                if (enrichmentData.success && enrichmentData.enrichedData) {
                    const data = enrichmentData.enrichedData;

                    // Update part in database
                    await prisma.part.update({
                        where: { id: part.id },
                        data: {
                            description: data.fullDescription || part.description,
                            category: data.category || part.category,
                            compatibleVehicles: data.compatibleVehicles || [],
                            specifications: data.specifications || {},
                            oemStatus: data.oemStatus,
                            estimatedLifespan: data.estimatedLifespan,
                            interchangeableParts: data.interchangeableParts || [],
                            aiNotes: [
                                data.commonIssues,
                                data.maintenanceNotes,
                                data.warrantyInfo,
                            ].filter(Boolean).join('\n\n'),
                            lastEnriched: new Date(),
                        },
                    });

                    successCount++;
                    results.push({
                        partNumber: part.partNumber,
                        status: 'success',
                        source: enrichmentData.source,
                    });
                } else {
                    failCount++;
                    results.push({
                        partNumber: part.partNumber,
                        status: 'failed',
                        error: 'No enrichment data',
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                failCount++;
                results.push({
                    partNumber: part.partNumber,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return NextResponse.json({
            success: true,
            total: parts.length,
            successCount,
            failCount,
            results,
        });

    } catch (error) {
        console.error('Bulk enrichment error:', error);
        return NextResponse.json(
            {
                error: 'Failed to enrich parts',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get enrichment statistics
        const total = await prisma.part.count();
        const enriched = await prisma.part.count({
            where: { lastEnriched: { not: null } },
        });
        const needsEnrichment = await prisma.part.count({
            where: {
                lastEnriched: null,
            },
        });

        return NextResponse.json({
            total,
            enriched,
            needsEnrichment,
            enrichmentRate: total > 0 ? Math.round((enriched / total) * 100) : 0,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get statistics' },
            { status: 500 }
        );
    }
}

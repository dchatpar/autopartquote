import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add Part API with Automatic Background Enrichment
 * Triggers image scraping + DeepSeek enrichment automatically
 */

export async function POST(request: NextRequest) {
    try {
        const partData = await request.json();

        const { partNumber, description, brand, category, stockQuantity, unitPrice } = partData;

        if (!partNumber || !description) {
            return NextResponse.json(
                { error: 'Part number and description are required' },
                { status: 400 }
            );
        }

        // Create part in database
        const part = await prisma.part.create({
            data: {
                partNumber,
                description,
                brand: brand || 'Toyota',
                category: category || 'Auto Parts',
                stockQuantity: stockQuantity || 0,
                costPrice: unitPrice || 0,
                sellingPrice: unitPrice || 0,
            },
        });

        // Trigger background enrichment (non-blocking)
        triggerBackgroundEnrichment(part.id, partNumber, description, brand).catch(err => {
            console.error('Background enrichment failed:', err);
        });

        return NextResponse.json({
            success: true,
            part,
            message: 'Part added successfully. AI enrichment running in background.',
        });

    } catch (error) {
        console.error('Add part error:', error);
        return NextResponse.json(
            {
                error: 'Failed to add part',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

async function triggerBackgroundEnrichment(
    partId: string,
    partNumber: string,
    description: string,
    brand?: string
) {
    try {
        // Run image scraping and AI enrichment in parallel
        const [imageResult, enrichmentResult] = await Promise.allSettled([
            // Image scraping
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partNumber, description }),
            }).then(res => res.json()),

            // DeepSeek AI enrichment
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/enrich-part`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partNumber, description, brand: brand || 'Toyota' }),
            }).then(res => res.json()),
        ]);

        // Update part with enriched data
        const updates: Record<string, unknown> = {};

        // Add image if found
        if (imageResult.status === 'fulfilled' && imageResult.value.imageUrl) {
            updates.cachedImageUrl = imageResult.value.imageUrl;
            updates.lastImageUpdate = new Date();
        }

        // Add enriched data if found
        if (enrichmentResult.status === 'fulfilled' && enrichmentResult.value.success) {
            const enriched = enrichmentResult.value.enrichedData;
            updates.description = enriched.fullDescription || description;
            updates.category = enriched.category || updates.category;
            updates.compatibleVehicles = enriched.compatibleVehicles || [];
            updates.specifications = enriched.specifications || {};
            updates.oemStatus = enriched.oemStatus;
            updates.estimatedLifespan = enriched.estimatedLifespan;
            updates.interchangeableParts = enriched.interchangeableParts || [];
            updates.aiNotes = [
                enriched.commonIssues,
                enriched.maintenanceNotes,
                enriched.warrantyInfo,
            ].filter(Boolean).join('\n\n');
            updates.lastEnriched = new Date();
        }

        // Update part in database
        if (Object.keys(updates).length > 0) {
            await prisma.part.update({
                where: { id: partId },
                data: updates,
            });
            console.log(`✅ Part ${partNumber} enriched successfully`);
        }

    } catch (error) {
        console.error(`Failed to enrich part ${partNumber}:`, error);
    }
}

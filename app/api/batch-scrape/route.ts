import { NextRequest, NextResponse } from 'next/server';
import { batchScrapeImages } from '@/lib/scraper';

export async function POST(request: NextRequest) {
    try {
        const { parts } = await request.json();

        if (!Array.isArray(parts) || parts.length === 0) {
            return NextResponse.json(
                { error: 'Parts array is required' },
                { status: 400 }
            );
        }

        const results = await batchScrapeImages(parts);

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Batch scraping error:', error);
        return NextResponse.json(
            { error: 'Failed to batch scrape images' },
            { status: 500 }
        );
    }
}

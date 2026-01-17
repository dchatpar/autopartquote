import { NextRequest, NextResponse } from 'next/server';
import { scrapePartImage } from '@/lib/scraper';

export async function POST(request: NextRequest) {
    try {
        const { partNumber, description } = await request.json();

        if (!partNumber) {
            return NextResponse.json(
                { error: 'Part number is required' },
                { status: 400 }
            );
        }

        const result = await scrapePartImage(partNumber, description || '');

        return NextResponse.json(result);
    } catch (error) {
        console.error('Image scraping error:', error);
        return NextResponse.json(
            { error: 'Failed to scrape image' },
            { status: 500 }
        );
    }
}

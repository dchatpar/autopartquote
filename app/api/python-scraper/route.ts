import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Python Image Scraper API
 * Uses the powerful Python scraper from scripts folder
 */

export async function POST(request: NextRequest) {
    try {
        const { partNumber, description } = await request.json();

        if (!partNumber) {
            return NextResponse.json(
                { error: 'Part number is required' },
                { status: 400 }
            );
        }

        // Create search query combining part number and description
        const searchQuery = description
            ? `${partNumber} ${description} auto part`
            : `${partNumber} auto part`;

        console.log(`🔍 Scraping image for: ${searchQuery}`);

        // Path to Python scraper
        const scriptsPath = path.join('C:', 'Users', 'dchat', 'Desktop', 'scripts');
        const scraperPath = path.join(scriptsPath, 'image_scraper.py');
        const outputDir = path.join(process.cwd(), 'public', 'parts');

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Run Python scraper
        const command = `python "${scraperPath}" "${searchQuery}" --limit 1 --output "${outputDir}" --hd`;

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 30000, // 30 second timeout
            });

            console.log('Python scraper output:', stdout);
            if (stderr) console.error('Python scraper errors:', stderr);

            // Find the saved image
            const files = await fs.readdir(outputDir);
            const imageFile = files.find(f =>
                f.toLowerCase().includes(partNumber.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );

            if (imageFile) {
                const imageUrl = `/parts/${imageFile}`;
                return NextResponse.json({
                    success: true,
                    imageUrl,
                    partNumber,
                    message: 'Image scraped successfully',
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'No image found',
                });
            }
        } catch (execError) {
            console.error('Python execution error:', execError);
            return NextResponse.json({
                success: false,
                error: 'Failed to execute Python scraper',
                details: execError instanceof Error ? execError.message : 'Unknown error',
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Python scraper API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to scrape image',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

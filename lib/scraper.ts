import puppeteer from 'puppeteer';
import { prisma } from './prisma';

export interface ScraperResult {
    partNumber: string;
    imageUrl: string | null;
    quality: 'high' | 'medium' | 'low';
    source: string;
    cached: boolean;
}

/**
 * Scrape image using Puppeteer
 * Optimized for robustness and serverless environments (as much as possible)
 */
export async function scrapePartImage(
    partNumber: string,
    description: string = ''
): Promise<ScraperResult> {
    // Check cache first
    const cached = await prisma.imageCache.findUnique({
        where: { partNumber },
    });

    if (cached) {
        await prisma.imageCache.update({
            where: { partNumber },
            data: { lastUsed: new Date() },
        });

        return {
            partNumber,
            imageUrl: cached.imageUrl,
            quality: cached.quality as 'high' | 'medium' | 'low',
            source: cached.source,
            cached: true,
        };
    }

    let browser = null;
    try {
        console.log(`Starting scrape for ${partNumber}...`);

        // Launch Puppeteer with Vercel-friendly flags
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process', // Crucial for some serverless envs
                '--no-zygote',
            ],
            // minimal executable path logic if needed, but relying on default for now
        });

        const page = await browser.newPage();

        // Block resources to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['font', 'stylesheet', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setViewport({ width: 1280, height: 800 });

        // Search Google Images
        const query = encodeURIComponent(`${partNumber} ${description} auto part`);
        const searchUrl = `https://www.google.com/search?q=${query}&tbm=isch`;

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Wait for at least one image container
        await page.waitForSelector('img', { timeout: 5000 }).catch(() => console.log('Timeout waiting for images'));

        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            // Filter out small icons/logos
            return images
                .filter(img => img.width > 50 && img.height > 50)
                .map(img => img.src)
                .filter(src => src.startsWith('http'))
                .slice(0, 5);
        });

        console.log(`Found ${imageUrls.length} candidate images for ${partNumber}`);

        if (imageUrls.length > 0) {
            const bestImage = imageUrls[0];

            // Cache it
            await prisma.imageCache.create({
                data: {
                    partNumber,
                    imageUrl: bestImage,
                    quality: 'medium',
                    source: 'google_scraper',
                },
            });

            return {
                partNumber,
                imageUrl: bestImage,
                quality: 'medium',
                source: 'google_scraper',
                cached: false,
            };
        }

        return {
            partNumber,
            imageUrl: null,
            quality: 'low',
            source: 'not_found',
            cached: false,
        };

    } catch (error) {
        console.error(`Scraping failed for ${partNumber}:`, error);
        return {
            partNumber,
            imageUrl: null,
            quality: 'low',
            source: 'error',
            cached: false,
        };
    } finally {
        if (browser) {
            await browser.close().catch(e => console.error('Error closing browser:', e));
        }
    }
}

/**
 * Batch scrape images
 */
export async function batchScrapeImages(
    parts: Array<{ partNumber: string; description: string }>
): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];
    for (const part of parts) {
        results.push(await scrapePartImage(part.partNumber, part.description));
    }
    return results;


    return results;
}

import { chromium, Browser } from 'playwright';
import { IMAGE_SCRAPER_CONFIG } from './constants';
import { prisma } from './prisma';

export interface ScraperResult {
    partNumber: string;
    imageUrl: string | null;
    quality: 'high' | 'medium' | 'low';
    source: string;
    cached: boolean;
}

let browser: Browser | null = null;

/**
 * Initialize browser instance (reused across scraping sessions)
 */
async function getBrowser(): Promise<Browser> {
    if (!browser) {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }
    return browser;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

/**
 * Check if image URL contains watermark indicators
 */
function hasWatermark(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return IMAGE_SCRAPER_CONFIG.watermarkBlacklist.some(term => lowerUrl.includes(term));
}

/**
 * Check if image is from a preferred domain
 */
function isPreferredDomain(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return IMAGE_SCRAPER_CONFIG.preferredDomains.some(domain => lowerUrl.includes(domain));
}

/**
 * Scrape image for a single part number
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
        // Update last used timestamp
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

    // Scrape new image
    try {
        const browser = await getBrowser();
        const context = await browser.newContext({
            userAgent: getRandomUserAgent(),
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();

        // Set timeout
        page.setDefaultTimeout(IMAGE_SCRAPER_CONFIG.timeout);

        // Search Google Images
        const query = encodeURIComponent(`${partNumber} ${description} genuine auto part`);
        await page.goto(`https://www.google.com/search?q=${query}&tbm=isch`, {
            waitUntil: 'domcontentloaded',
        });

        // Wait for images to load
        await page.waitForSelector('img', { timeout: 5000 }).catch(() => { });

        // Extract image URLs
        const imageData = await page.evaluate((config) => {
            const imgs = Array.from(document.querySelectorAll('img'));

            return imgs
                .filter(img => img.width > config.minImageWidth)
                .map(img => ({
                    url: img.src,
                    width: img.width,
                    height: img.height,
                }))
                .slice(0, 10); // Get first 10 candidates
        }, IMAGE_SCRAPER_CONFIG);

        await context.close();

        // Find best image
        let bestImage = imageData.find(img =>
            isPreferredDomain(img.url) && !hasWatermark(img.url)
        );

        if (!bestImage) {
            bestImage = imageData.find(img => !hasWatermark(img.url));
        }

        if (!bestImage && imageData.length > 0) {
            bestImage = imageData[0];
        }

        if (!bestImage) {
            return {
                partNumber,
                imageUrl: null,
                quality: 'low',
                source: 'google',
                cached: false,
            };
        }

        // Determine quality
        const quality = isPreferredDomain(bestImage.url) ? 'high' :
            bestImage.width > 800 ? 'medium' : 'low';

        // Cache the result
        await prisma.imageCache.create({
            data: {
                partNumber,
                imageUrl: bestImage.url,
                quality,
                source: 'google',
            },
        });

        return {
            partNumber,
            imageUrl: bestImage.url,
            quality,
            source: 'google',
            cached: false,
        };

    } catch (error) {
        console.error(`Failed to scrape image for ${partNumber}:`, error);
        return {
            partNumber,
            imageUrl: null,
            quality: 'low',
            source: 'google',
            cached: false,
        };
    }
}

/**
 * Batch scrape images with concurrency control
 */
export async function batchScrapeImages(
    parts: Array<{ partNumber: string; description: string }>
): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];
    const queue = [...parts];
    const workers: Promise<void>[] = [];

    const processNext = async () => {
        while (queue.length > 0) {
            const part = queue.shift();
            if (!part) break;

            const result = await scrapePartImage(part.partNumber, part.description);
            results.push(result);
        }
    };

    // Create concurrent workers
    for (let i = 0; i < IMAGE_SCRAPER_CONFIG.concurrentWorkers; i++) {
        workers.push(processNext());
    }

    await Promise.all(workers);
    return results;
}

/**
 * Get random user agent to avoid detection
 */
function getRandomUserAgent(): string {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

import { BRAND_PATTERNS, CATEGORY_KEYWORDS, PART_CATEGORIES } from "./constants";

export interface ParsedPartRow {
    srNumber: number;
    partNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    brand?: string;
    category?: string;
}

/**
 * Smart parser for Dakshin PI format
 * Handles the standard format: SR# | PART# | DESCRIPTION | QTY | PRICE | TOTAL
 */
export function parsePartsList(text: string): ParsedPartRow[] {
    const lines = text.trim().split('\n');
    const results: ParsedPartRow[] = [];

    for (const line of lines) {
        // Skip header rows or empty lines
        if (!line.trim() || line.includes('SR #') || line.includes('PART #')) {
            continue;
        }

        // Try to parse the line
        const parsed = parsePartLine(line);
        if (parsed) {
            results.push(parsed);
        }
    }

    return results;
}

/**
 * Parse a single line of part data
 */
function parsePartLine(line: string): ParsedPartRow | null {
    // Split by tabs first, then by multiple spaces
    let parts = line.trim().split(/\t/);

    // If we don't have enough parts with tabs, try splitting by multiple spaces
    if (parts.length < 5) {
        parts = line.trim().split(/\s{2,}/);
    }

    // Filter out empty parts and trim
    parts = parts.filter(p => p.trim()).map(p => p.trim());

    if (parts.length < 5) {
        return null;
    }

    try {
        const srNumber = parseInt(parts[0]);
        const partNumber = parts[1].trim();
        const description = parts[2].trim();

        // Handle quantity - might have extra spaces
        const quantityStr = parts[3].replace(/\s+/g, '').trim();
        const quantity = parseInt(quantityStr);

        // Extract price (remove "AED" prefix, spaces, and commas)
        const unitPriceStr = parts[4].replace(/AED|,|\s+/g, '').trim();
        const unitPrice = parseFloat(unitPriceStr);

        // Extract total (if present, otherwise calculate)
        let total: number;
        if (parts.length >= 6) {
            const totalStr = parts[5].replace(/AED|,|\s+/g, '').trim();
            total = parseFloat(totalStr);
        } else {
            total = quantity * unitPrice;
        }

        // Validate numbers
        if (isNaN(srNumber) || isNaN(quantity) || isNaN(unitPrice) || isNaN(total)) {
            return null;
        }

        // Detect brand
        const brand = detectBrand(partNumber);

        // Categorize part
        const category = categorizePart(description);

        return {
            srNumber,
            partNumber,
            description,
            quantity,
            unitPrice,
            total,
            brand,
            category,
        };
    } catch (error) {
        console.error('Failed to parse line:', line, error);
        return null;
    }
}

/**
 * Detect brand from part number using regex patterns
 */
export function detectBrand(partNumber: string): string | undefined {
    for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
        if (pattern.test(partNumber)) {
            return brand;
        }
    }
    return undefined;
}

/**
 * Categorize part based on description keywords
 */
export function categorizePart(description: string): string {
    const lowerDesc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return "Other";
}

/**
 * Generate reference number in Dakshin format
 * Format: DTSB-[CustomerCode]-[Date]-[Brand]
 * Example: DTSB-2WZ-10JAN26-TYT
 */
export function generateReferenceNumber(
    customerCode: string,
    brand?: string
): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);

    const datePart = `${day}${month}${year}`;
    const brandSuffix = brand ? `-${brand.substring(0, 3).toUpperCase()}` : '';

    return `DTSB-${customerCode}-${datePart}${brandSuffix}`;
}

/**
 * Calculate margin percentage
 */
export function calculateMargin(costPrice: number, sellingPrice: number): number {
    if (sellingPrice === 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

/**
 * Check if margin is healthy (above threshold)
 */
export function isMarginHealthy(costPrice: number, sellingPrice: number, threshold: number = 15): boolean {
    return calculateMargin(costPrice, sellingPrice) >= threshold;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'AED'): string {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Aggregate quote items by category for Zoho summary
 */
export function aggregateByCategory(items: ParsedPartRow[]): Array<{
    category: string;
    quantity: number;
    total: number;
}> {
    const categoryMap = new Map<string, { quantity: number; total: number }>();

    for (const item of items) {
        const category = item.category || 'Other';
        const existing = categoryMap.get(category) || { quantity: 0, total: 0 };

        categoryMap.set(category, {
            quantity: existing.quantity + item.quantity,
            total: existing.total + item.total,
        });
    }

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data,
    }));
}

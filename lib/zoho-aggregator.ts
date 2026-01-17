import { QuoteItem } from './store';

interface AggregatedCategory {
    category: string;
    quantity: number;
    total: number;
    itemCount: number;
}

/**
 * Aggregate 5000+ quote items into summary categories for Zoho Books
 * This keeps Zoho estimates under the 1000-row limit
 */
export function aggregateForZoho(items: QuoteItem[]): AggregatedCategory[] {
    const categoryMap = new Map<string, AggregatedCategory>();

    items.forEach((item) => {
        const category = item.category || 'Other';
        const existing = categoryMap.get(category);

        if (existing) {
            existing.quantity += item.quantity;
            existing.total += item.total;
            existing.itemCount += 1;
        } else {
            categoryMap.set(category, {
                category,
                quantity: item.quantity,
                total: item.total,
                itemCount: 1,
            });
        }
    });

    // Convert to array and sort by total (highest first)
    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
}

/**
 * Convert aggregated categories to Zoho line items format
 */
export function toZohoLineItems(aggregated: AggregatedCategory[]) {
    return aggregated.map((cat) => ({
        name: cat.category,
        description: `${cat.itemCount} parts - See detailed attachment`,
        quantity: 1, // We use quantity 1 and put total in rate
        rate: cat.total,
        item_total: cat.total,
    }));
}

/**
 * Generate Zoho estimate payload
 */
export function createZohoEstimatePayload(
    customerId: string,
    referenceNumber: string,
    items: QuoteItem[],
    notes?: string
) {
    const aggregated = aggregateForZoho(items);
    const lineItems = toZohoLineItems(aggregated);

    return {
        customer_id: customerId,
        reference_number: referenceNumber,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        line_items: lineItems,
        notes: notes || `Detailed breakdown of ${items.length} parts attached as PDF`,
        terms: 'Payment terms as per agreement',
        custom_fields: [
            {
                customfield_id: 'cf_total_line_items',
                value: items.length.toString(),
            },
        ],
    };
}

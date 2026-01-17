import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { zohoClient } from '@/lib/zoho-client';

export async function POST() {
    try {
        // 1. Fetch recently modified customers from Zoho
        // In a real scenario, we'd store the last sync time in a DB setting or simply check the last 24h
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const zohoContacts = await zohoClient.getContacts(yesterday);

        const syncResults = {
            created: 0,
            updated: 0,
            failed: 0,
            errors: [] as string[]
        };

        // 2. Process incoming Zoho contacts -> Local DB
        for (const rawContact of zohoContacts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contact = rawContact as any;
            try {
                // Determine VAT rate based on country or custom field, default to 5% (0.05)
                // This logic can be refined based on actual business rules
                const vatRate = 0.05;

                // Map Zoho contact to our schema
                // Note: Adjust field mapping based on your actual Zoho fields
                const customerData = {
                    zohoId: contact.id,
                    name: `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim(),
                    email: contact.Email || null,
                    phone: contact.Phone || contact.Mobile || null,
                    company: contact.Account_Name?.name || null,
                    address: contact.Mailing_Street || null,
                    country: contact.Mailing_Country || 'UAE',
                    vatNumber: contact.VAT_Number || null, // Assuming custom field exists
                    code: contact.Customer_Code || `Z-${contact.id.substring(0, 6)}`, // Fallback code
                    vatRate: vatRate,
                    lastSynced: new Date(),
                };

                // Check if customer exists by Zoho ID or Email
                const existingCustomer = await prisma.customer.findFirst({
                    where: {
                        OR: [
                            { zohoId: contact.id },
                            { email: contact.Email || undefined }
                        ]
                    }
                });

                if (existingCustomer) {
                    await prisma.customer.update({
                        where: { id: existingCustomer.id },
                        data: customerData
                    });
                    syncResults.updated++;
                } else {
                    await prisma.customer.create({
                        data: customerData
                    });
                    syncResults.created++;
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error(`Failed to sync contact ${contact.id}:`, errorMessage);
                syncResults.failed++;
                syncResults.errors.push(`Zoho Contact ${contact.id}: ${errorMessage}`);
            }
        }

        // 3. (Optional) Reverse Sync: Push local changes to Zoho
        // This usually requires tracking a 'dirty' flag or checking 'updatedAt' > 'lastSynced'
        // For now, we'll focus on pulling from Zoho as the master source for contacts

        return NextResponse.json({
            success: true,
            message: 'Sync completed',
            results: syncResults
        });

    } catch (error: any) {
        console.error('Zoho sync error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error during sync',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Zoho Books API for testing
 * Simulates Zoho Books responses without actual API calls
 */

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { action } = data;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        switch (action) {
            case 'create_estimate':
                return NextResponse.json({
                    success: true,
                    estimate: {
                        estimate_id: `EST-${Date.now()}`,
                        estimate_number: `EST-${Math.floor(Math.random() * 10000)}`,
                        status: 'draft',
                        customer_name: data.customerName || 'Test Customer',
                        total: data.total || 0,
                        created_time: new Date().toISOString(),
                    },
                });

            case 'upload_attachment':
                return NextResponse.json({
                    success: true,
                    message: 'PDF attached successfully',
                    attachment_id: `ATT-${Date.now()}`,
                });

            case 'find_customer':
                return NextResponse.json({
                    success: true,
                    contacts: [
                        {
                            contact_id: 'CUST-001',
                            contact_name: 'Al Futtaim Motors',
                            email: 'contact@alfuttaim.ae',
                            phone: '+971 50 123 4567',
                        },
                        {
                            contact_id: 'CUST-002',
                            contact_name: 'Emirates Auto',
                            email: 'info@emiratesauto.ae',
                            phone: '+971 55 987 6543',
                        },
                    ],
                });

            case 'create_customer':
                return NextResponse.json({
                    success: true,
                    contact: {
                        contact_id: `CUST-${Date.now()}`,
                        contact_name: data.contact_name,
                        email: data.email,
                        phone: data.phone,
                        created_time: new Date().toISOString(),
                    },
                });

            default:
                return NextResponse.json({
                    success: true,
                    message: 'Mock API response',
                });
        }
    } catch (error) {
        console.error('Mock Zoho API error:', error);
        return NextResponse.json(
            { error: 'Mock API error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Mock Zoho Books API is running',
        endpoints: [
            'create_estimate',
            'upload_attachment',
            'find_customer',
            'create_customer',
        ],
    });
}

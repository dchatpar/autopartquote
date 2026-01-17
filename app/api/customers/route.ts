import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { zohoClient } from '@/lib/zoho-client';

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { company: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({
            success: true,
            customers,
            total: customers.length,
        });
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, company, address, vatNumber, country, code } = body;

        if (!name || !email || !country) {
            return NextResponse.json(
                { error: 'Name, email, and country are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existing = await prisma.customer.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Customer with this email already exists' },
                { status: 409 }
            );
        }

        // Generate code if not provided
        const customerCode = code || generateCustomerCode(name);

        // Create customer
        const customer = await prisma.customer.create({
            data: {
                code: customerCode,
                name,
                email,
                phone,
                company,
                address,
                vatNumber,
                country,
                vatRate: country === 'UAE' ? 0.05 : 0.00, // Default VAT rates
            },
        });

        // TODO: Push to Zoho Books
        try {
            await pushCustomerToZoho(customer);
        } catch (zohoError) {
            console.error('Failed to push to Zoho:', zohoError);
            // Don't fail the request if Zoho sync fails
        }

        return NextResponse.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Failed to create customer:', error);
        return NextResponse.json(
            {
                error: 'Failed to create customer',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

function generateCustomerCode(name: string): string {
    // Generate 3-letter code from name
    const cleaned = name.replace(/[^A-Z]/gi, '').toUpperCase();
    if (cleaned.length >= 3) {
        return cleaned.substring(0, 3);
    }
    return (cleaned + 'XXX').substring(0, 3);
}

async function pushCustomerToZoho(customer: any) {
    try {
        console.log(`Pushing customer ${customer.id} to Zoho...`);
        const zohoId = await zohoClient.createContact(customer);

        if (zohoId) {
            await prisma.customer.update({
                where: { id: customer.id },
                data: { zohoId }
            });
            console.log(`Successfully synced customer to Zoho. Zoho ID: ${zohoId}`);
        }
    } catch (error) {
        // We log the error but don't rethrow it to avoid failing the customer creation request
        // The background sync will catch this customer later
        console.error('Failed to push customer to Zoho:', error);
    }
}

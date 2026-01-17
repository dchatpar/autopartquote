import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers/[id] - Get single customer
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const customer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, email, phone, company, address, vatNumber } = body;

        // Check if customer exists
        const existing = await prisma.customer.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Update customer
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                company,
                address,
                vatNumber,
                lastSynced: new Date(),
            },
        });

        // TODO: Sync to Zoho Books
        try {
            await syncCustomerToZoho(customer);
        } catch (zohoError) {
            console.error('Failed to sync to Zoho:', zohoError);
        }

        return NextResponse.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Failed to update customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.customer.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error) {
        console.error('Failed to delete customer:', error);
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        );
    }
}

async function syncCustomerToZoho(customer: any) {
    // TODO: Implement Zoho Books API integration
    console.log('Syncing customer to Zoho:', customer.id);
    // This will be implemented in Phase 4
}

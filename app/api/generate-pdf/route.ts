import { NextRequest, NextResponse } from 'next/server';
import { generateQuotePDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const {
            items,
            referenceNumber,
            customerName,
            customerEmail,
            subtotal,
            vatRate,
            vatAmount,
            grandTotal,
            currency,
        } = data;

        // Validate required fields
        if (!items || !referenceNumber || !customerName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate PDF
        const pdfBuffer = await generateQuotePDF({
            items,
            referenceNumber,
            customerName,
            customerEmail,
            subtotal,
            vatRate,
            vatAmount,
            grandTotal,
            currency,
        });

        // Return PDF as downloadable file
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Quote_${referenceNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}

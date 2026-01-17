import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Email API for testing
 * Simulates email sending without actual SMTP
 */

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { to, subject, message, attachmentName } = data;

        // Validate required fields
        if (!to || !subject) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject' },
                { status: 400 }
            );
        }

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('📧 Mock Email Sent:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message?.substring(0, 100)}...`);
        console.log(`Attachment: ${attachmentName || 'None'}`);

        return NextResponse.json({
            success: true,
            message: `Email sent to ${to}`,
            emailId: `EMAIL-${Date.now()}`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Mock email error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

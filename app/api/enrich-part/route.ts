import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenRouter AI Part Intelligence Engine
 * Using Google Gemini Flash 1.5 - Free, Fast, Excellent
 */

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-flash-1.5-8b'; // Faster 8B model, still free

interface VehicleCompatibility {
    make: string;
    model: string;
    years: string;
    engine?: string;
    trim?: string;
}

interface PartSpecifications {
    material?: string;
    dimensions?: string;
    weight?: string;
    color?: string;
    finish?: string;
    [key: string]: string | undefined;
}

interface EnrichedPartData {
    partNumber: string;
    fullDescription: string;
    compatibleVehicles: VehicleCompatibility[];
    category: string;
    subcategory?: string;
    specifications: PartSpecifications;
    oemStatus: 'OEM' | 'Aftermarket' | 'Unknown';
    manufacturer: string;
    estimatedLifespan?: string;
    installationDifficulty?: 'Easy' | 'Moderate' | 'Difficult' | 'Professional';
    interchangeableParts?: string[];
    commonIssues?: string;
    maintenanceNotes?: string;
    warrantyInfo?: string;
    priceRange?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { partNumber, description, brand } = await request.json();

        if (!partNumber) {
            return NextResponse.json(
                { error: 'Part number is required' },
                { status: 400 }
            );
        }

        console.log(`🤖 OpenRouter (Gemini Flash) analyzing: ${partNumber}`);

        const prompt = `You are an expert automotive parts database AI. Analyze this Toyota part number and provide comprehensive, accurate information.

Part Number: ${partNumber}
Current Description: ${description || 'Not provided'}
Brand: ${brand || 'Toyota'}

IMPORTANT: Provide detailed, factual information about this specific part. If you don't have exact information, provide reasonable estimates based on the part number pattern and description.

Return ONLY valid JSON (no markdown, no code blocks) in this EXACT format:
{
  "partNumber": "${partNumber}",
  "fullDescription": "Complete detailed description of the part including its function and purpose",
  "compatibleVehicles": [
    {
      "make": "Toyota",
      "model": "Camry",
      "years": "2015-2020",
      "engine": "2.5L 4-Cylinder",
      "trim": "LE, SE, XLE"
    }
  ],
  "category": "Engine",
  "subcategory": "Gaskets & Seals",
  "specifications": {
    "material": "Rubber/Metal composite",
    "dimensions": "10cm x 5cm x 2cm",
    "weight": "50g",
    "color": "Black",
    "finish": "OEM Standard"
  },
  "oemStatus": "OEM",
  "manufacturer": "Toyota Motor Corporation",
  "estimatedLifespan": "80,000-100,000 km under normal conditions",
  "installationDifficulty": "Moderate",
  "interchangeableParts": ["04427-42181", "04427-42182"],
  "commonIssues": "May develop cracks after prolonged exposure to heat and oil",
  "maintenanceNotes": "Inspect during regular service intervals. Replace if any signs of wear or damage.",
  "warrantyInfo": "12 months or 20,000 km manufacturer warranty",
  "priceRange": "AED 150-250 (OEM), AED 80-120 (Aftermarket)"
}

Provide as much accurate detail as possible. This information will be displayed to customers.`;

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://dakshinquote.vercel.app',
                'X-Title': 'Dakshin Trading Parts Enrichment',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert automotive parts database with comprehensive knowledge of Toyota parts. Always respond with valid JSON only. Be detailed and accurate.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenRouter API error:', error);

            return NextResponse.json({
                success: true,
                enrichedData: createFallbackData(partNumber, description, brand),
                source: 'fallback',
            });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            return NextResponse.json({
                success: true,
                enrichedData: createFallbackData(partNumber, description, brand),
                source: 'fallback',
            });
        }

        let enrichedData: EnrichedPartData;
        try {
            const cleanedResponse = aiResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            enrichedData = JSON.parse(cleanedResponse);

            if (!enrichedData.partNumber || !enrichedData.fullDescription) {
                throw new Error('Missing required fields');
            }

        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError, aiResponse.substring(0, 200));
            return NextResponse.json({
                success: true,
                enrichedData: createFallbackData(partNumber, description, brand),
                source: 'fallback',
            });
        }

        return NextResponse.json({
            success: true,
            partNumber,
            enrichedData,
            source: 'openrouter-gemini',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('OpenRouter enrichment error:', error);

        const { partNumber, description, brand } = await request.json();
        return NextResponse.json({
            success: true,
            enrichedData: createFallbackData(partNumber, description, brand),
            source: 'fallback',
        });
    }
}

function createFallbackData(partNumber: string, description?: string, brand?: string): EnrichedPartData {
    return {
        partNumber,
        fullDescription: description || `Toyota part ${partNumber}`,
        compatibleVehicles: [
            {
                make: brand || 'Toyota',
                model: 'Various Models',
                years: 'Multiple Years',
            },
        ],
        category: 'Auto Parts',
        specifications: {},
        oemStatus: 'Unknown',
        manufacturer: brand || 'Toyota',
    };
}

/**
 * Bulk Part Enrichment using DeepSeek AI
 * Enriches all parts with vehicle compatibility data
 */

const parts = [
    { partNumber: "04427-42180", description: "BOOT KIT, FR DRIVE" },
    { partNumber: "11115-24040", description: "GASKET, CYLINDER" },
    { partNumber: "43211-33130", description: "KNUCKLE, STEERING" },
    { partNumber: "90919-02276", description: "COIL, IGNITION" },
    { partNumber: "90919-05096", description: "SENSOR, CRANK" },
];

async function enrichParts() {
    console.log('🤖 Starting AI Part Enrichment with DeepSeek...\n');

    for (const part of parts) {
        console.log(`Enriching: ${part.partNumber} - ${part.description}`);

        try {
            const response = await fetch('http://localhost:3000/api/enrich-part', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partNumber: part.partNumber,
                    description: part.description,
                    brand: 'Toyota',
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Success!');
                console.log('Compatible Vehicles:', result.enrichedData.compatibleVehicles);
                console.log('Category:', result.enrichedData.category);
                console.log('OEM Status:', result.enrichedData.oemStatus);
                console.log('Notes:', result.enrichedData.notes);
            } else {
                console.log('❌ Failed:', result.error);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('');

        // Wait 2 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✨ Enrichment complete!');
}

enrichParts();

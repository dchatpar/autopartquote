/**
 * Test Image Scraping Locally
 * Run this to test if image scraping works with your parts
 */

const testParts = [
    { partNumber: '04427-42180', description: 'BOOT KIT, FR DRIVE' },
    { partNumber: '11115-24040', description: 'GASKET, CYLINDER' },
    { partNumber: '43211-33130', description: 'KNUCKLE, STEERING' },
];

async function testImageScraping() {
    console.log('🔍 Testing Image Scraping...\n');

    for (const part of testParts) {
        console.log(`Testing: ${part.partNumber} - ${part.description}`);

        try {
            const response = await fetch('http://localhost:3000/api/scrape-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(part),
            });

            const result = await response.json();

            if (result.imageUrl) {
                console.log(`✅ Success: ${result.imageUrl}`);
            } else {
                console.log(`❌ Failed: No image found`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('');
    }
}

testImageScraping();

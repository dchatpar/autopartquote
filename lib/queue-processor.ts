import { useQueueStore, QueueItem } from './queue-store';

const MAX_RETRIES = 3;
const BATCH_SIZE = 3; // Process 3 items at a time

export async function processQueue() {
    const {
        items,
        isPaused,
        isProcessing,
        setProcessing,
        updateItem,
    } = useQueueStore.getState();

    if (isPaused || isProcessing) return;

    const pendingItems = items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) {
        setProcessing(false);
        return;
    }

    setProcessing(true);

    // Process in batches
    for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
        if (useQueueStore.getState().isPaused) {
            setProcessing(false);
            return;
        }

        const batch = pendingItems.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(item => processItem(item)));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setProcessing(false);
}

async function processItem(item: QueueItem) {
    // Re-fetch item to ensure we have latest details
    const currentItem = useQueueStore.getState().items.find(i => i.id === item.id) || item;
    const { updateItem } = useQueueStore.getState();

    try {
        updateItem(item.id, { status: 'processing' });

        // Step 1: Save part to database
        const saveResponse = await fetch('/api/add-part', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partNumber: item.partNumber,
                description: item.description,
                brand: item.brand || 'Toyota',
                category: 'Auto Parts',
                quantity: 1,
                unitPrice: 0,
            }),
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save part to database');
        }

        const saveResult = await saveResponse.json();
        const partId = saveResult.part.id;

        updateItem(item.id, { partId });

        // Step 2: Scrape image
        const imageResponse = await fetch('/api/scrape-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partNumber: item.partNumber,
                description: item.description,
            }),
        });

        const imageResult = await imageResponse.json();
        const imageFound = !!imageResult.imageUrl;

        updateItem(item.id, {
            progress: {
                ...item.progress,
                imageFound,
            },
            details: {
                ...item.details,
                imageUrl: imageResult.imageUrl,
            }
        });

        // Step 3: Get vehicle info from AI
        const enrichResponse = await fetch('/api/enrich-part', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partNumber: item.partNumber,
                description: item.description,
                brand: item.brand || 'Toyota',
            }),
        });

        const enrichResult = await enrichResponse.json();
        const vehicleInfoFound = enrichResult.success &&
            enrichResult.enrichedData?.compatibleVehicles?.length > 0;

        // Extract found fields for granular display
        const foundAiFields = [];
        if (vehicleInfoFound) foundAiFields.push('Compatible Vehicles');
        if (enrichResult.enrichedData?.specifications?.length > 0) foundAiFields.push('Specifications');
        if (enrichResult.enrichedData?.interchangeableParts?.length > 0) foundAiFields.push('Interchange');
        if (enrichResult.enrichedData?.oemStatus) foundAiFields.push('OEM Status');

        updateItem(item.id, {
            progress: {
                ...item.progress,
                vehicleInfoFound,
            },
            details: {
                ...item.details,
                aiFields: foundAiFields,
                aiModel: 'Gemini Flash 1.5-8b',
            }
        });

        // Step 4: Check if we have both image and vehicle info
        if (!imageFound || !vehicleInfoFound) {
            updateItem(item.id, {
                status: 'incomplete',
                error: `Missing: ${!imageFound ? 'image' : ''} ${!vehicleInfoFound ? 'vehicle info' : ''}`.trim(),
            });
            return;
        }

        // Step 5: Update part in database with enriched data
        await fetch(`/api/parts/${partId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cachedImageUrl: imageResult.imageUrl,
                compatibleVehicles: enrichResult.enrichedData.compatibleVehicles,
                specifications: enrichResult.enrichedData.specifications,
                oemStatus: enrichResult.enrichedData.oemStatus,
                estimatedLifespan: enrichResult.enrichedData.estimatedLifespan,
                interchangeableParts: enrichResult.enrichedData.interchangeableParts,
                aiNotes: [
                    enrichResult.enrichedData.commonIssues,
                    enrichResult.enrichedData.maintenanceNotes,
                    enrichResult.enrichedData.warrantyInfo,
                ].filter(Boolean).join('\n\n'),
                lastEnriched: new Date(),
                lastImageUpdate: new Date(),
            }),
        });

        updateItem(item.id, {
            status: 'completed',
            completedAt: new Date(),
            progress: {
                imageFound: true,
                vehicleInfoFound: true,
                enrichmentComplete: true,
            },
        });

    } catch (error) {
        console.error(`Failed to process ${item.partNumber}:`, error);

        const retryCount = item.retryCount + 1;

        if (retryCount < MAX_RETRIES) {
            // Retry
            updateItem(item.id, {
                status: 'pending',
                retryCount,
                error: `Retry ${retryCount}/${MAX_RETRIES}`,
            });
        } else {
            // Max retries reached
            updateItem(item.id, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

// Auto-start processing when items are added
if (typeof window !== 'undefined') {
    useQueueStore.subscribe((state, prevState) => {
        const hasNewPending = state.items.some(i => i.status === 'pending') &&
            state.items.length > prevState.items.length;

        if (hasNewPending && !state.isProcessing && !state.isPaused) {
            processQueue();
        }
    });
}

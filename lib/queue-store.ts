import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueueItemProgress {
    imageFound: boolean;
    vehicleInfoFound: boolean;
    enrichmentComplete: boolean;
}

export interface QueueItem {
    id: string;
    partNumber: string;
    description: string;
    brand?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'incomplete';
    progress: QueueItemProgress;
    details?: {
        imageUrl?: string;
        aiFields?: string[];
        aiModel?: string;
    };
    error?: string;
    retryCount: number;
    createdAt: Date;
    completedAt?: Date;
    partId?: string; // Database ID after saving
}

interface QueueState {
    items: QueueItem[];
    isProcessing: boolean;
    isPaused: boolean;

    // Actions
    addToQueue: (items: Omit<QueueItem, 'status' | 'progress' | 'retryCount' | 'createdAt'>[]) => void;
    updateItem: (id: string, updates: Partial<QueueItem>) => void;
    removeItem: (id: string) => void;
    clearCompleted: () => void;
    clearAll: () => void;

    setProcessing: (processing: boolean) => void;
    setPaused: (paused: boolean) => void;

    // Getters
    getPendingCount: () => number;
    getProcessingCount: () => number;
    getCompletedCount: () => number;
    getFailedCount: () => number;
    getIncompleteCount: () => number;
}

export const useQueueStore = create<QueueState>()(
    persist(
        (set, get) => ({
            items: [],
            isProcessing: false,
            isPaused: false,

            addToQueue: (newItems) => {
                const items = newItems.map(item => ({
                    ...item,
                    status: 'pending' as const,
                    progress: {
                        imageFound: false,
                        vehicleInfoFound: false,
                        enrichmentComplete: false,
                    },
                    retryCount: 0,
                    createdAt: new Date(),
                }));

                set((state) => ({
                    items: [...state.items, ...items],
                }));
            },

            updateItem: (id, updates) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    ),
                }));
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            clearCompleted: () => {
                set((state) => ({
                    items: state.items.filter((item) => item.status !== 'completed'),
                }));
            },

            clearAll: () => {
                set({ items: [], isProcessing: false, isPaused: false });
            },

            setProcessing: (processing) => set({ isProcessing: processing }),
            setPaused: (paused) => set({ isPaused: paused }),

            getPendingCount: () => get().items.filter(i => i.status === 'pending').length,
            getProcessingCount: () => get().items.filter(i => i.status === 'processing').length,
            getCompletedCount: () => get().items.filter(i => i.status === 'completed').length,
            getFailedCount: () => get().items.filter(i => i.status === 'failed').length,
            getIncompleteCount: () => get().items.filter(i => i.status === 'incomplete').length,
        }),
        {
            name: 'enrichment-queue',
        }
    )
);

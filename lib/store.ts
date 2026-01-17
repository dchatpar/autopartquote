import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteItem {
    id: string;
    partNumber: string;
    description: string;
    brand?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
    imageUrl?: string;
    imageLoading?: boolean;
    enrichedData?: Record<string, unknown> | null;
}

export interface Customer {
    id?: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    vatNumber?: string;
}

export interface QuoteMetadata {
    quoteNumber: string;
    date: string;
    validUntil: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    template: 'modern' | 'professional';
}

export interface QuoteState {
    // Quote data
    metadata: QuoteMetadata;
    customer: Customer | null;
    items: QuoteItem[];

    // Pricing
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    shippingCost: number;
    total: number;

    // Terms
    terms: string;
    notes: string;
    paymentTerms: string;
    deliveryTerms: string;

    // UI state
    currentStep: number;
    isPreviewVisible: boolean;

    // Actions
    setMetadata: (metadata: Partial<QuoteMetadata>) => void;
    setCustomer: (customer: Customer | null) => void;
    setItems: (items: QuoteItem[]) => void;
    addItem: (item: QuoteItem) => void;
    updateItem: (id: string, updates: Partial<QuoteItem>) => void;
    removeItem: (id: string) => void;
    reorderItems: (startIndex: number, endIndex: number) => void;

    setTaxRate: (rate: number) => void;
    setDiscount: (discount: number) => void;
    setShippingCost: (cost: number) => void;

    setTerms: (terms: string) => void;
    setNotes: (notes: string) => void;
    setPaymentTerms: (terms: string) => void;
    setDeliveryTerms: (terms: string) => void;

    setCurrentStep: (step: number) => void;
    togglePreview: () => void;

    calculateTotals: () => void;
    resetQuote: () => void;
}

const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QT-${year}${month}-${random}`;
};

const getValidUntilDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days validity
    return date.toISOString().split('T')[0];
};

export const useQuoteStore = create<QuoteState>()(
    persist(
        (set, get) => ({
            // Initial state
            metadata: {
                quoteNumber: generateQuoteNumber(),
                date: new Date().toISOString().split('T')[0],
                validUntil: getValidUntilDate(),
                status: 'draft',
                template: 'modern',
            },
            customer: null,
            items: [],
            subtotal: 0,
            taxRate: 5, // 5% VAT
            taxAmount: 0,
            discount: 0,
            shippingCost: 0,
            total: 0,
            terms: 'Payment due within 30 days. All prices in AED.',
            notes: '',
            paymentTerms: '30 days net',
            deliveryTerms: 'Standard delivery 3-5 business days',
            currentStep: 0,
            isPreviewVisible: true,

            // Actions
            setMetadata: (metadata) =>
                set((state) => ({
                    metadata: { ...state.metadata, ...metadata },
                })),

            setCustomer: (customer) => set({ customer }),

            setItems: (items) => {
                set({ items });
                get().calculateTotals();
            },

            addItem: (item) => {
                set((state) => ({ items: [...state.items, item] }));
                get().calculateTotals();
            },

            updateItem: (id, updates) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    ),
                }));
                get().calculateTotals();
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
                get().calculateTotals();
            },

            reorderItems: (startIndex, endIndex) => {
                set((state) => {
                    const items = Array.from(state.items);
                    const [removed] = items.splice(startIndex, 1);
                    items.splice(endIndex, 0, removed);
                    return { items };
                });
            },

            setTaxRate: (rate) => {
                set({ taxRate: rate });
                get().calculateTotals();
            },

            setDiscount: (discount) => {
                set({ discount });
                get().calculateTotals();
            },

            setShippingCost: (cost) => {
                set({ shippingCost: cost });
                get().calculateTotals();
            },

            setTerms: (terms) => set({ terms }),
            setNotes: (notes) => set({ notes }),
            setPaymentTerms: (paymentTerms) => set({ paymentTerms }),
            setDeliveryTerms: (deliveryTerms) => set({ deliveryTerms }),

            setCurrentStep: (step) => set({ currentStep: step }),
            togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),

            calculateTotals: () => {
                const state = get();
                const subtotal = state.items.reduce((sum, item) => {
                    const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
                    return sum + itemTotal;
                }, 0);

                const discountAmount = subtotal * (state.discount / 100);
                const subtotalAfterDiscount = subtotal - discountAmount;
                const taxAmount = subtotalAfterDiscount * (state.taxRate / 100);
                const total = subtotalAfterDiscount + taxAmount + state.shippingCost;

                set({
                    subtotal,
                    taxAmount,
                    total,
                });
            },

            resetQuote: () => {
                set({
                    metadata: {
                        quoteNumber: generateQuoteNumber(),
                        date: new Date().toISOString().split('T')[0],
                        validUntil: getValidUntilDate(),
                        status: 'draft',
                        template: 'modern',
                    },
                    customer: null,
                    items: [],
                    subtotal: 0,
                    taxAmount: 0,
                    discount: 0,
                    shippingCost: 0,
                    total: 0,
                    currentStep: 0,
                });
            },
        }),
        {
            name: 'quote-storage',
        }
    )
);

// Image queue store (existing)
interface ImageQueueItem {
    id: string;
    partNumber: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ImageQueueState {
    queue: ImageQueueItem[];
    addToQueue: (items: Omit<ImageQueueItem, 'status'>[]) => void;
    markProcessing: (id: string) => void;
    markCompleted: (id: string) => void;
    markFailed: (id: string) => void;
    clearQueue: () => void;
}

export const useImageQueueStore = create<ImageQueueState>((set) => ({
    queue: [],

    addToQueue: (items) =>
        set((state) => ({
            queue: [
                ...state.queue,
                ...items.map((item) => ({ ...item, status: 'pending' as const })),
            ],
        })),

    markProcessing: (id) =>
        set((state) => ({
            queue: state.queue.map((item) =>
                item.id === id ? { ...item, status: 'processing' as const } : item
            ),
        })),

    markCompleted: (id) =>
        set((state) => ({
            queue: state.queue.map((item) =>
                item.id === id ? { ...item, status: 'completed' as const } : item
            ),
        })),

    markFailed: (id) =>
        set((state) => ({
            queue: state.queue.map((item) =>
                item.id === id ? { ...item, status: 'failed' as const } : item
            ),
        })),

    clearQueue: () => set({ queue: [] }),
}));

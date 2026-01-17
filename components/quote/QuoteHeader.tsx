"use client";

import { Calendar, User, FileText } from "lucide-react";
import { useQuoteStore } from "@/lib/store";

export function QuoteHeader() {
    const { metadata, customer, items, total } = useQuoteStore();

    return (
        <div className="glass border-b border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Quote Builder</h1>
                    <p className="text-sm text-muted-foreground">
                        Create professional quotes with AI-powered insights
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Quote Number</div>
                        <div className="font-mono font-semibold">{metadata.quoteNumber}</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{metadata.date}</span>
                </div>

                {customer && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.name}</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{items.length} items</span>
                </div>

                <div className="ml-auto">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-lg font-bold text-action-blue">
                        AED {total.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

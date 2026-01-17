"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { QuoteBuilder } from "@/components/quote/QuoteBuilder";

export default function QuotesPage() {
    return (
        <div className="h-screen flex bg-deep-space text-foreground">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
                <QuoteBuilder />
            </div>
        </div>
    );
}

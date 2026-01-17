"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { QuoteHeader } from "@/components/quote/QuoteHeader";
import { QuoteTable } from "@/components/quote/QuoteTable";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { SmartPaste } from "@/components/quote/SmartPaste";
import { ImageScrapingProgress } from "@/components/quote/ImageScrapingProgress";
import { useQuoteStore } from "@/lib/store";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

export default function Home() {
  const { items } = useQuoteStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex bg-deep-space text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <QuoteHeader />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Table or Smart Paste */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            {items.length === 0 ? (
              <div className="max-w-2xl mx-auto w-full">
                <SmartPaste />
              </div>
            ) : (
              <QuoteTable />
            )}
          </div>

          {/* Right: Summary */}
          {items.length > 0 && <QuoteSummary />}
        </div>
      </div>

      {/* Floating Progress Indicator */}
      <ImageScrapingProgress />
    </div>
  );
}

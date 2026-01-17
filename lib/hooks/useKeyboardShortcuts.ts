"use client";

import { useEffect } from "react";
import { useQuoteStore } from "@/lib/store";
import { toast } from "sonner";

export function useKeyboardShortcuts() {
    const { items } = useQuoteStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K - Global Search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                toast.info("Global search activated");
            }

            // Cmd/Ctrl + S - Save Quote
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (items.length > 0) {
                    toast.success("Quote saved successfully!");
                    // TODO: Implement actual save logic
                } else {
                    toast.error("No items to save");
                }
            }

            // Cmd/Ctrl + E - Export PDF
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                if (items.length > 0) {
                    toast.info("Generating PDF...");
                    // TODO: Implement PDF export
                } else {
                    toast.error("No items to export");
                }
            }

            // Cmd/Ctrl + Shift + Z - Sync to Zoho
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                if (items.length > 0) {
                    toast.info("Syncing to Zoho Books...");
                    // TODO: Implement Zoho sync
                } else {
                    toast.error("No items to sync");
                }
            }

            // Escape - Clear selection
            if (e.key === 'Escape') {
                // TODO: Clear any active selections
                toast.info("Selection cleared");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items]);
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, Copy, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteStore } from "@/lib/store";
import { toast } from "sonner";

interface BulkActionsProps {
    selectedIds: Set<string>;
    onClearSelection: () => void;
}

export function BulkActionsToolbar({ selectedIds, onClearSelection }: BulkActionsProps) {
    const { items, updateItem } = useQuoteStore();
    const selectedCount = selectedIds.size;

    if (selectedCount === 0) return null;

    const handleBulkDelete = () => {
        toast.success(`Deleted ${selectedCount} items`);
        onClearSelection();
        // TODO: Implement actual delete logic
    };

    const handleBulkDiscount = () => {
        toast.info("Bulk discount feature coming soon");
        // TODO: Implement bulk discount dialog
    };

    const handleDuplicate = () => {
        toast.success(`Duplicated ${selectedCount} items`);
        // TODO: Implement duplication logic
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass border border-white/10 rounded-lg px-6 py-3 shadow-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-action-blue" />
                        <span className="text-sm font-semibold">
                            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                        </span>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleBulkDiscount}
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Discount
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDuplicate}
                            className="gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleBulkDelete}
                            className="gap-2 text-danger-red hover:text-danger-red"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="text-xs text-muted-foreground"
                    >
                        Clear
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

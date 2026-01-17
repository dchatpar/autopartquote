"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuoteStore, QuoteItem } from "@/lib/store";
import { formatCurrency, detectBrand } from "@/lib/parser";
import { Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuoteTable() {
    const { items } = useQuoteStore();
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48, // 48px row height
        overscan: 10,
    });

    if (items.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No parts added yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Paste your parts list or import from CSV to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Table Header */}
            <div className="glass border-b border-white/10 px-6 py-3">
                <div className="grid grid-cols-[50px_60px_120px_1fr_80px_100px_100px_40px] gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div>SR#</div>
                    <div>Image</div>
                    <div>Part #</div>
                    <div>Description</div>
                    <div>Brand</div>
                    <div className="text-right">Qty</div>
                    <div className="text-right">Unit Price</div>
                    <div className="text-right">Total</div>
                </div>
            </div>

            {/* Virtualized Table Body */}
            <div
                ref={parentRef}
                className="flex-1 overflow-auto"
                style={{ contain: "strict" }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = items[virtualRow.index];
                        return (
                            <QuoteRow
                                key={item.id}
                                item={item}
                                index={virtualRow.index}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface QuoteRowProps {
    item: QuoteItem;
    style: React.CSSProperties;
    index: number;
}

function QuoteRow({ item, style, index }: QuoteRowProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={style}
            className={cn(
                "px-6 border-b border-white/5 hover:bg-white/5 transition-smooth cursor-pointer",
                index % 2 === 0 && "bg-white/[0.02]"
            )}
        >
            <div className="grid grid-cols-[50px_60px_120px_1fr_80px_100px_100px_40px] gap-4 items-center h-full">
                {/* SR Number */}
                <div className="text-sm text-muted-foreground">{index + 1}</div>

                {/* Image */}
                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-elevated-surface border border-white/10">
                    {item.imageLoading ? (
                        <Skeleton className="w-full h-full shimmer" />
                    ) : item.imageUrl && !imageError ? (
                        <img
                            src={item.imageUrl}
                            alt={item.partNumber}
                            className="w-full h-full object-contain"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground opacity-30" />
                        </div>
                    )}
                </div>

                {/* Part Number */}
                <div className="font-mono text-sm font-semibold text-action-blue">
                    {item.partNumber}
                </div>

                {/* Description */}
                <div className="text-sm truncate">{item.description}</div>

                {/* Brand */}
                <div>
                    {item.brand && (
                        <Badge variant="outline" className="text-xs">
                            {item.brand}
                        </Badge>
                    )}
                </div>

                {/* Quantity */}
                <div className="text-sm text-right font-medium">{item.quantity}</div>

                {/* Unit Price */}
                <div className="text-sm text-right font-medium">
                    AED {item.unitPrice.toFixed(2)}
                </div>

                {/* Total */}
                <div className="text-sm text-right font-bold text-success-green">
                    AED {item.total.toFixed(2)}
                </div>
            </div>
        </motion.div>
    );
}

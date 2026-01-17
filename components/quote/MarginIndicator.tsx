"use client";

import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateMargin, isMarginHealthy } from "@/lib/parser";

interface MarginIndicatorProps {
    costPrice?: number;
    sellingPrice: number;
    threshold?: number;
}

export function MarginIndicator({ costPrice, sellingPrice, threshold = 15 }: MarginIndicatorProps) {
    if (!costPrice || costPrice === 0) return null;

    const margin = calculateMargin(costPrice, sellingPrice);
    const healthy = isMarginHealthy(costPrice, sellingPrice, threshold);

    if (healthy) {
        return (
            <Badge variant="outline" className="gap-1 text-success-green border-success-green/30 bg-success-green/10">
                <TrendingUp className="h-3 w-3" />
                {margin.toFixed(1)}%
            </Badge>
        );
    }

    if (margin > 0) {
        return (
            <Badge variant="outline" className="gap-1 text-warning-amber border-warning-amber/30 bg-warning-amber/10">
                <AlertCircle className="h-3 w-3" />
                {margin.toFixed(1)}%
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="gap-1 text-danger-red border-danger-red/30 bg-danger-red/10">
            <TrendingDown className="h-3 w-3" />
            {margin.toFixed(1)}%
        </Badge>
    );
}

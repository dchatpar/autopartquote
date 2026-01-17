"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteStore } from "@/lib/store";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function QuotePreview() {
    const { metadata, setMetadata } = useQuoteStore();
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => setZoom(Math.min(zoom + 10, 150));
    const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50));

    return (
        <div className="h-full flex flex-col bg-deep-space">
            {/* Preview Toolbar */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Preview</span>
                    <Select
                        value={metadata.template}
                        onValueChange={(value: 'modern' | 'professional') =>
                            setMetadata({ template: value })
                        }
                    >
                        <SelectTrigger className="w-40 h-8 text-xs bg-elevated-surface border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-3 w-3" />
                    </Button>
                    <span className="text-xs w-12 text-center">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s',
                    }}
                    className="max-w-4xl mx-auto"
                >
                    {metadata.template === 'modern' ? (
                        <ModernTemplate />
                    ) : (
                        <ProfessionalTemplate />
                    )}
                </div>
            </div>
        </div>
    );
}

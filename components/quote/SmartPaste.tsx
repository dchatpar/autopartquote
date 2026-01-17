"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteStore, QuoteItem } from "@/lib/store";
import { parsePartsList } from "@/lib/parser";
import { toast } from "sonner";

export function SmartPaste() {
    const [pasteText, setPasteText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { setItems } = useQuoteStore();

    const handlePaste = async () => {
        if (!pasteText.trim()) {
            toast.error("Please paste some data first");
            return;
        }

        setIsProcessing(true);

        try {
            // Parse the pasted text
            const parsed = parsePartsList(pasteText);

            if (parsed.length === 0) {
                toast.error("No valid parts found in the pasted data");
                setIsProcessing(false);
                return;
            }

            // Convert to QuoteItems
            const items: QuoteItem[] = parsed.map((part, index) => ({
                ...part,
                id: `item-${Date.now()}-${index}`,
                imageLoading: true,
                discount: 0,
                total: part.quantity * part.unitPrice,
            }));

            // Add to store
            setItems(items);

            toast.success(`Successfully imported ${items.length} parts`, {
                description: "AI enrichment & images loading in background",
            });

            // Clear the textarea
            setPasteText("");

            // Start background processing (images + AI enrichment)
            startBackgroundProcessing(items);

        } catch (error) {
            console.error("Parse error:", error);
            toast.error("Failed to parse the data. Please check the format.");
        } finally {
            setIsProcessing(false);
        }
    };

    const startBackgroundProcessing = async (items: QuoteItem[]) => {
        try {
            // Send to backend queue
            const res = await fetch('/api/parts/batch-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parts: items.map(item => ({
                        partNumber: item.partNumber,
                        description: item.description,
                        brand: item.brand,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    }))
                })
            });

            if (!res.ok) throw new Error("Failed to queue items");

            toast.success(`queued ${items.length} parts!`, {
                description: "Go to the Queue page to monitor progress.",
                action: {
                    label: "View Queue",
                    onClick: () => window.location.href = '/queue'
                }
            });

        } catch (error) {
            console.error(error);
            toast.error("Failed to queue items for background processing");
        }
    };

    return (
        <Card className="p-6 bg-elevated-surface border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">Smart Paste</h3>
                    <p className="text-sm text-muted-foreground">
                        Paste your parts list and we&apos;ll handle the rest
                    </p>
                </div>
            </div>

            <Textarea
                value={pasteText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPasteText(e.target.value)}
                placeholder="Paste your parts list here (SR# | Part# | Description | Qty | Price | Total)..."
                className="min-h-[200px] font-mono text-sm bg-deep-space border-white/10 mb-4"
            />

            <div className="flex gap-3">
                <Button
                    onClick={handlePaste}
                    disabled={isProcessing || !pasteText.trim()}
                    className="flex-1 gradient-blue glow-blue"
                >
                    {isProcessing ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                            </motion.div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4 mr-2" />
                            Parse & Import
                        </>
                    )}
                </Button>

                <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                </Button>
            </div>

            {/* Format Example */}
            <div className="mt-4 p-3 rounded-lg bg-deep-space border border-white/5">
                <p className="text-xs text-muted-foreground mb-2">Expected format:</p>
                <pre className="text-xs font-mono text-muted-foreground">
                    {`1    04427-42180    BOOT KIT, FR DRIVE    2    AED 227.77    AED 455.54
2    11115-24040    GASKET, CYLINDER      2    AED 76.96     AED 153.92`}
                </pre>
            </div>
        </Card>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Save,
    Send,
    FileText,
    Maximize2,
    Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuoteStore } from "@/lib/store";
import { QuoteWizard } from "./QuoteWizard";
import { QuotePreview } from "./QuotePreview";
import { toast } from "sonner";

export function QuoteBuilder() {
    const {
        currentStep,
        setCurrentStep,
        isPreviewVisible,
        togglePreview,
        metadata,
        customer,
        items,
        total,
    } = useQuoteStore();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const handleSave = useCallback(() => {
        // Save to localStorage (already handled by zustand persist)
        setLastSaved(new Date());
        toast.success("Quote auto-saved", {
            description: new Date().toLocaleTimeString(),
        });
    }, []);

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            handleSave();
        }, 30000);

        return () => clearInterval(interval);
    }, [handleSave]);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinalize = () => {
        toast.success("Quote finalized!", {
            description: `Quote ${metadata.quoteNumber} is ready to send`,
        });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return customer !== null;
            case 1: return items.length > 0;
            case 2: return true;
            case 3: return true;
            case 4: return true;
            default: return false;
        }
    };

    return (
        <div className={`h-screen flex flex-col bg-deep-space text-foreground ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Top Toolbar */}
            <div className="glass border-b border-white/10 p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-action-blue" />
                        <div>
                            <h2 className="font-semibold text-sm md:text-base">
                                Quote Builder
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {metadata.quoteNumber} • {customer?.name || 'No customer selected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lastSaved && (
                            <span className="text-xs text-muted-foreground hidden md:block">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={togglePreview}
                            className="hidden md:flex"
                        >
                            {isPreviewVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            Preview
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="hidden md:flex"
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Save</span>
                        </Button>

                        <Button
                            size="sm"
                            className="gradient-blue glow-blue"
                            disabled={!canProceed() || currentStep !== 4}
                            onClick={handleFinalize}
                        >
                            <Send className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Finalize</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content - Split Screen */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Pane - Wizard */}
                <div className={`flex-1 overflow-auto border-r border-white/10 ${isPreviewVisible ? 'md:w-1/2' : 'w-full'}`}>
                    <QuoteWizard />
                </div>

                {/* Right Pane - Preview */}
                <AnimatePresence>
                    {isPreviewVisible && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '50%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hidden md:block overflow-auto bg-elevated-surface"
                        >
                            <QuotePreview />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="glass border-t border-white/10 p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {[0, 1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-2 w-2 rounded-full transition-all ${step === currentStep
                                    ? 'bg-action-blue w-8'
                                    : step < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={currentStep === 4 || !canProceed()}
                        className="gradient-blue"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                {/* Mobile Preview Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePreview}
                    className="w-full mt-3 md:hidden"
                >
                    {isPreviewVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                </Button>
            </div>

            {/* Mobile Preview Modal */}
            {isPreviewVisible && (
                <div className="md:hidden fixed inset-0 bg-deep-space z-40 overflow-auto">
                    <div className="p-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={togglePreview}
                            className="mb-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Editor
                        </Button>
                        <QuotePreview />
                    </div>
                </div>
            )}
        </div>
    );
}

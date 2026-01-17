"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Pause,
    Play,
    X,
    Trash2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueueStore } from "@/lib/queue-store";
import { Badge } from "@/components/ui/badge";

export function QueuePanel() {
    const {
        items,
        isProcessing,
        isPaused,
        setPaused,
        clearCompleted,
        clearAll,
        getPendingCount,
        getProcessingCount,
        getCompletedCount,
        getFailedCount,
        getIncompleteCount,
    } = useQueueStore();

    const [isExpanded, setIsExpanded] = useState(false);


    // Show panel when there are items
    const isVisible = items.length > 0;

    if (!isVisible) return null;

    const pendingCount = getPendingCount();
    const processingCount = getProcessingCount();
    const completedCount = getCompletedCount();
    const failedCount = getFailedCount();
    const incompleteCount = getIncompleteCount();
    const totalCount = items.length;

    const progress = totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 z-50 w-96"
        >
            <Card className="bg-elevated-surface border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {isProcessing && !isPaused ? (
                                <Loader2 className="h-5 w-5 animate-spin text-action-blue" />
                            ) : isPaused ? (
                                <Pause className="h-5 w-5 text-warning-amber" />
                            ) : (
                                <CheckCircle className="h-5 w-5 text-success-green" />
                            )}
                            <h3 className="font-semibold">Enrichment Queue</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            {isProcessing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPaused(!isPaused)}
                                >
                                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </Button>

                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {completedCount} of {totalCount} completed
                            </span>
                            <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-action-blue"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 mt-3">
                        {pendingCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {pendingCount} pending
                            </Badge>
                        )}
                        {processingCount > 0 && (
                            <Badge className="bg-action-blue text-xs">
                                {processingCount} processing
                            </Badge>
                        )}
                        {failedCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {failedCount} failed
                            </Badge>
                        )}
                        {incompleteCount > 0 && (
                            <Badge className="bg-warning-amber text-xs">
                                {incompleteCount} incomplete
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                                {items.slice(-10).reverse().map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded bg-deep-space border border-white/5 space-y-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Status Icon */}
                                            <div className="flex-shrink-0">
                                                {item.status === 'processing' && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-action-blue" />
                                                )}
                                                {item.status === 'completed' && (
                                                    <CheckCircle className="h-4 w-4 text-success-green" />
                                                )}
                                                {item.status === 'failed' && (
                                                    <XCircle className="h-4 w-4 text-danger-red" />
                                                )}
                                                {item.status === 'incomplete' && (
                                                    <AlertCircle className="h-4 w-4 text-warning-amber" />
                                                )}
                                                {item.status === 'pending' && (
                                                    <div className="h-4 w-4 rounded-full bg-white/20" />
                                                )}
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-mono font-semibold truncate flex items-center gap-2">
                                                    {item.partNumber}
                                                    {item.details?.aiModel && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                                                            {item.details.aiModel}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {item.description}
                                                </div>
                                            </div>

                                            {/* Image Preview (Small) */}
                                            {item.details?.imageUrl && (
                                                <div className="h-8 w-8 rounded overflow-hidden border border-white/10 flex-shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={item.details.imageUrl}
                                                        alt="Part"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Granular Progress Details */}
                                        {(item.details?.imageUrl || item.details?.aiFields) && (
                                            <div className="pl-7 space-y-1">
                                                {item.details.imageUrl && (
                                                    <div className="text-[10px] text-green-400 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Image Scraped
                                                    </div>
                                                )}
                                                {item.details.aiFields && item.details.aiFields.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.details.aiFields.map((field, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-[10px] h-4 px-1 bg-blue-500/10 text-blue-300 border-blue-500/20"
                                                            >
                                                                {field}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {item.error && (
                                            <div className="pl-7 text-xs text-danger-red truncate">
                                                Error: {item.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-white/10 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCompleted}
                                    disabled={completedCount === 0}
                                    className="flex-1"
                                >
                                    Clear Completed
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAll}
                                    className="flex-1"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}

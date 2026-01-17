"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useImageQueueStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ImageScrapingProgress() {
    const { queue, clearQueue } = useImageQueueStore();

    const total = queue.length;
    const completed = queue.filter(item => item.status === 'completed').length;
    const failed = queue.filter(item => item.status === 'failed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (total === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 right-4 z-50"
            >
                <Card className="p-4 bg-elevated-surface border-white/10 w-80 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">Fetching Part Images</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearQueue}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {completed} of {total} images loaded ({percentage}%)
                            </span>
                            {failed > 0 && (
                                <span className="text-danger-red text-xs">{failed} failed</span>
                            )}
                        </div>

                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-action-blue"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {queue.slice(-5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                    {item.status === 'processing' && (
                                        <Loader2 className="h-3 w-3 animate-spin text-action-blue" />
                                    )}
                                    {item.status === 'completed' && (
                                        <CheckCircle className="h-3 w-3 text-success-green" />
                                    )}
                                    {item.status === 'failed' && (
                                        <XCircle className="h-3 w-3 text-danger-red" />
                                    )}
                                    {item.status === 'pending' && (
                                        <div className="h-3 w-3 rounded-full bg-white/20" />
                                    )}
                                    <span className="truncate">{item.partNumber}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}

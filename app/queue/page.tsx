"use client";

import { useEffect, useState, useRef } from "react";

import {
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play,
    Pause,
    RefreshCw,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

interface QueueItem {
    id: string;
    partNumber: string;
    description: string;
    brand: string;
    enrichmentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    enrichmentError?: string;
    createdAt: string;
    updatedAt: string;
}

export default function QueuePage() {
    const [items, setItems] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
    });

    // Worker ref to allow stopping
    const isProcessingRef = useRef(false);

    // Fetch queue items
    const fetchQueue = async () => {
        try {
            const res = await fetch('/api/queue');
            if (!res.ok) throw new Error('Failed to fetch queue');
            const data = await res.json();
            setItems(data.items);
            setStats(data.stats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load queue");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5s for updates
        return () => clearInterval(interval);
    }, []);

    // Queue Processor (Client-Side Worker)
    const processQueue = async () => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        setIsProcessing(true);
        toast.info("Started processing queue");

        // Loop until stopped or no pending items
        while (isProcessingRef.current) {
            // Find next pending item (refresh list first to avoid race conditions/stale state)
            // We fetch the latest list or just pick from current state if valid?
            // Safer to fetch one pending item from API or use the list.

            const pendingItems = items.filter(i => i.enrichmentStatus === 'PENDING');
            if (pendingItems.length === 0) {
                // Done
                isProcessingRef.current = false;
                setIsProcessing(false);
                toast.success("Queue processing complete!");
                break;
            }

            const itemToProcess = pendingItems[0];

            try {
                // 1. Mark as PROCESSING
                await updateStatus(itemToProcess.id, 'PROCESSING');

                // 2. Call Enrichment API (This does the heavy lifting: Images + AI)
                const res = await fetch('/api/enrich-part', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partNumber: itemToProcess.partNumber,
                        description: itemToProcess.description,
                        brand: itemToProcess.brand
                    })
                });

                if (!res.ok) throw new Error('Enrichment API failed');

                // 3. Mark as COMPLETED
                await updateStatus(itemToProcess.id, 'COMPLETED');

            } catch (error) {
                console.error(`Failed to process ${itemToProcess.partNumber}`, error);
                await updateStatus(itemToProcess.id, 'FAILED', error instanceof Error ? error.message : 'Unknown error');
            }

            // Small delay to be nice
            await new Promise(r => setTimeout(r, 1000));

            // Refresh local list to reflect changes
            await fetchQueue();
        }
    };

    const stopProcessing = () => {
        isProcessingRef.current = false;
        setIsProcessing(false);
        toast.info("Processing paused");
    };

    const updateStatus = async (id: string, status: string, error?: string) => {
        await fetch(`/api/queue/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, error })
        });
        // Optimistic update
        setItems(prev => prev.map(i => i.id === id ? { ...i, enrichmentStatus: status as QueueItem['enrichmentStatus'], enrichmentError: error } : i));
    };

    const clearCompleted = async () => {
        if (!confirm("Remove completed items from queue view? (Data remains in catalog)")) return;
        await fetch('/api/queue/clear', { method: 'POST' });
        fetchQueue();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Enrichment Queue
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage background part enrichment tasks
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={isProcessing ? stopProcessing : processQueue}
                        className={isProcessing ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" : "gradient-blue glow-blue"}
                    >
                        {isProcessing ? (
                            <><Pause className="h-4 w-4 mr-2" /> Pause Processing</>
                        ) : (
                            <><Play className="h-4 w-4 mr-2" /> Start Processing</>
                        )}
                    </Button>
                    <Button variant="outline" onClick={fetchQueue}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={clearCompleted}>
                        <Trash2 className="h-4 w-4 hover:text-red-400" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-elevated-surface border-white/5">
                    <div className="text-sm text-muted-foreground mb-1">Pending</div>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                </Card>
                <Card className="p-4 bg-elevated-surface border-white/5">
                    <div className="text-sm text-muted-foreground mb-1">Processing</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.processing}</div>
                </Card>
                <Card className="p-4 bg-elevated-surface border-white/5">
                    <div className="text-sm text-muted-foreground mb-1">Completed</div>
                    <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                </Card>
                <Card className="p-4 bg-elevated-surface border-white/5">
                    <div className="text-sm text-muted-foreground mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                </Card>
            </div>

            {/* Queue List */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-medium text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Part Number</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading queue...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        Queue is empty. Import parts to start enrichment.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            {item.enrichmentStatus === 'PENDING' && (
                                                <Badge variant="secondary" className="bg-white/10">Pending</Badge>
                                            )}
                                            {item.enrichmentStatus === 'PROCESSING' && (
                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 animate-pulse">
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing
                                                </Badge>
                                            )}
                                            {item.enrichmentStatus === 'COMPLETED' && (
                                                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Completed
                                                </Badge>
                                            )}
                                            {item.enrichmentStatus === 'FAILED' && (
                                                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                                                    <AlertCircle className="h-3 w-3 mr-1" /> Failed
                                                </Badge>
                                            )}
                                            {item.enrichmentError && (
                                                <div className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={item.enrichmentError}>
                                                    {item.enrichmentError}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-medium">{item.partNumber}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {format(new Date(item.createdAt), 'HH:mm:ss')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {(item.enrichmentStatus === 'FAILED' || item.enrichmentStatus === 'PENDING') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateStatus(item.id, 'PENDING')} // Retry
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

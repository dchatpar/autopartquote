"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function DataEnrichmentPanel() {
    const [isEnriching, setIsEnriching] = useState(false);
    const [stats, setStats] = useState<{
        total: number;
        enriched: number;
        needsEnrichment: number;
        enrichmentRate: number;
    } | null>(null);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/bulk-enrich');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleEnrichAll = async () => {
        setIsEnriching(true);
        toast.info('Starting AI enrichment for all parts...');

        try {
            const response = await fetch('/api/bulk-enrich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceRefresh: false }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(
                    `Enriched ${result.successCount} parts successfully!`,
                    {
                        description: result.failCount > 0
                            ? `${result.failCount} parts failed`
                            : 'All parts enriched',
                    }
                );
                fetchStats();
            } else {
                toast.error('Enrichment failed');
            }
        } catch (error) {
            console.error('Enrichment error:', error);
            toast.error('Failed to enrich parts');
        } finally {
            setIsEnriching(false);
        }
    };

    const handleRefreshAll = async () => {
        setIsEnriching(true);
        toast.info('Refreshing all part data with latest AI information...');

        try {
            const response = await fetch('/api/bulk-enrich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceRefresh: true }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Refreshed ${result.successCount} parts!`);
                fetchStats();
            } else {
                toast.error('Refresh failed');
            }
        } catch (error) {
            console.error('Refresh error:', error);
            toast.error('Failed to refresh parts');
        } finally {
            setIsEnriching(false);
        }
    };

    // Fetch stats on mount
    React.useEffect(() => {
        fetchStats();
    }, []);

    return (
        <Card className="p-6 bg-elevated-surface border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">AI Data Enrichment</h3>
                    <p className="text-sm text-muted-foreground">
                        Auto-enrich parts with vehicle compatibility & detailed info
                    </p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-deep-space border border-white/5">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Parts</div>
                    </div>
                    <div className="p-3 rounded-lg bg-deep-space border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{stats.enriched}</div>
                        <div className="text-xs text-muted-foreground">Enriched</div>
                    </div>
                    <div className="p-3 rounded-lg bg-deep-space border border-yellow-500/20">
                        <div className="text-2xl font-bold text-yellow-400">{stats.needsEnrichment}</div>
                        <div className="text-xs text-muted-foreground">Need Enrichment</div>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    onClick={handleEnrichAll}
                    disabled={isEnriching}
                    className="flex-1 gradient-blue glow-blue"
                >
                    {isEnriching ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                            </motion.div>
                            Enriching...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Enrich Missing Data
                        </>
                    )}
                </Button>

                <Button
                    onClick={handleRefreshAll}
                    disabled={isEnriching}
                    variant="outline"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All
                </Button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                        <strong className="text-blue-400">Auto-enrichment:</strong> Parts are automatically enriched with:
                        vehicle compatibility, technical specs, OEM status, lifespan, maintenance notes, and more using DeepSeek AI.
                    </div>
                </div>
            </div>
        </Card>
    );
}

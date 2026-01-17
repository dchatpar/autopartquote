"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Database, Download, Plus, Filter } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MasterPart {
    id: string;
    partNumber: string;
    name: string;
    brand: string;
    category?: { name: string; slug: string };
    oemNumbers: string[];
    popularityScore: number;
}

export default function MasterCatalogPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [parts, setParts] = useState<MasterPart[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Simulate initial load or search
    const fetchMasterParts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/master-catalog?q=${searchTerm}&limit=50`);
            const data = await res.json();
            if (data.success) {
                setParts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch master catalog:", error);
            toast.error("Failed to load master catalog");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchMasterParts();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleImport = (partId: string) => {
        toast.success("Part imported to local inventory", {
            description: "You can now edit price and stock in Parts Catalog"
        });
        // In a real app, this would call an API to copy MasterPart -> Part
    };

    return (
        <div className="h-screen flex bg-deep-space text-foreground">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-b border-white/10 p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Database className="h-6 w-6 text-action-blue" />
                                Master Catalog
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Global database of standardized automotive parts
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                            <Button className="gap-2 gradient-blue glow-blue">
                                <Plus className="h-4 w-4" />
                                Request New Item
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-6 relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by part number, name, or OEM number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-elevated-surface border-white/10"
                        />
                    </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <Tabs defaultValue="all" className="mb-6">
                        <TabsList className="bg-elevated-surface border border-white/10">
                            <TabsTrigger value="all">All Parts</TabsTrigger>
                            <TabsTrigger value="toyota">Toyota</TabsTrigger>
                            <TabsTrigger value="nissan">Nissan</TabsTrigger>
                            <TabsTrigger value="honda">Honda</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-40 rounded-lg bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {parts.map((part, index) => (
                                <motion.div
                                    key={part.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="p-4 bg-elevated-surface border-white/10 hover:border-action-blue/30 transition-smooth group relative overflow-hidden">

                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                {part.brand}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                Pop: {part.popularityScore}
                                            </Badge>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1">{part.partNumber}</h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                            {part.name}
                                        </p>

                                        {part.oemNumbers && part.oemNumbers.length > 0 && (
                                            <div className="text-xs text-muted-foreground mb-4">
                                                <strong>OEM:</strong> {part.oemNumbers.slice(0, 3).join(", ")}
                                                {part.oemNumbers.length > 3 && "..."}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Button
                                                className="w-full gap-2 group-hover:gradient-blue transition-all"
                                                variant="outline"
                                                onClick={() => handleImport(part.id)}
                                            >
                                                <Download className="h-4 w-4" />
                                                Import to Inventory
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && parts.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <Database className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">Master Catalog Empty</h3>
                            <p className="text-sm">Run migration or seed data to see items here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

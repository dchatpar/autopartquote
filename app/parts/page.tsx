"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Package, RefreshCw, Sparkles, Info } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PartDetails } from "@/components/quote/PartDetails";
import { DataEnrichmentPanel } from "@/components/admin/DataEnrichmentPanel";

interface Part {
    id: string;
    partNumber: string;
    description: string;
    brand: string | null;
    category: string | null;
    stockQuantity: number;
    sellingPrice: number;
    cachedImageUrl: string | null;
    compatibleVehicles?: any[];
    specifications?: any;
    oemStatus?: string;
    estimatedLifespan?: string;
    aiNotes?: string;
    lastEnriched?: string;
}

export default function PartsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [parts, setParts] = useState<Part[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPart, setNewPart] = useState({
        partNumber: "",
        description: "",
        brand: "Toyota",
        category: "",
        stockQuantity: 0,
        unitPrice: 0,
    });

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/parts');
            const data = await response.json();

            if (data.success) {
                setParts(data.parts);
            }
        } catch (error) {
            console.error('Failed to fetch parts:', error);
            toast.error('Failed to load parts');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredParts = parts.filter((part) => {
        const matchesSearch =
            part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = selectedBrand === "all" || part.brand === selectedBrand;
        const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
        return matchesSearch && matchesBrand && matchesCategory;
    });

    const brands = Array.from(new Set(parts.map((p) => p.brand).filter(Boolean)));
    const categories = Array.from(new Set(parts.map((p) => p.category).filter(Boolean)));

    const handleAddPart = async () => {
        if (!newPart.partNumber || !newPart.description) {
            toast.error("Please fill in required fields");
            return;
        }

        try {
            const response = await fetch('/api/add-part', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPart),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Part added successfully!", {
                    description: "AI enrichment & images loading in background",
                });

                setIsAddDialogOpen(false);
                setNewPart({
                    partNumber: "",
                    description: "",
                    brand: "Toyota",
                    category: "",
                    stockQuantity: 0,
                    unitPrice: 0,
                });

                fetchParts();
            } else {
                toast.error(result.error || "Failed to add part");
            }
        } catch (error) {
            console.error('Add part error:', error);
            toast.error("Failed to add part");
        }
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="h-screen flex flex-col md:flex-row bg-deep-space text-foreground">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Mobile Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-b border-white/10 p-4 md:p-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">Parts Catalog</h1>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Browse and manage your parts inventory
                            </p>
                        </div>

                        <Button
                            className="gap-2 gradient-blue glow-blue w-full md:w-auto"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Part
                        </Button>
                    </div>

                    {/* Search & Filters - Mobile Responsive */}
                    <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search parts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-elevated-surface border-white/10"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="flex-1 md:w-40 bg-elevated-surface border-white/10">
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={String(brand)} value={String(brand)}>
                                            {String(brand)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="flex-1 md:w-52 bg-elevated-surface border-white/10">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={String(category)} value={String(category)}>
                                            {String(category)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </motion.div>

                {/* Parts Grid - Mobile Responsive */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {/* AI Enrichment Panel */}
                    <div className="mb-6">
                        <DataEnrichmentPanel />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                            <p className="text-muted-foreground">Loading parts...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredParts.map((part, index) => (
                                <motion.div
                                    key={part.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className="p-3 md:p-4 bg-elevated-surface border-white/10 hover:border-action-blue/30 transition-smooth">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                                            {/* Image - Responsive & Zoomable */}
                                            <div
                                                className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-deep-space border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => part.cachedImageUrl && setSelectedImage(part.cachedImageUrl)}
                                            >
                                                {part.cachedImageUrl ? (
                                                    <img
                                                        src={part.cachedImageUrl}
                                                        alt={part.partNumber}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            {/* Content - Responsive */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-semibold font-mono text-sm md:text-base text-action-blue truncate">
                                                        {part.partNumber}
                                                    </h3>
                                                    {part.brand && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {part.brand}
                                                        </Badge>
                                                    )}
                                                    {part.category && (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            {part.category}
                                                        </Badge>
                                                    )}
                                                    {part.lastEnriched && (
                                                        <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20">
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            AI Enriched
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                                    {part.description}
                                                </p>

                                                {/* Mobile: Show vehicle info inline */}
                                                {part.compatibleVehicles && part.compatibleVehicles.length > 0 && (
                                                    <div className="mt-2 md:hidden">
                                                        <p className="text-xs text-blue-400">
                                                            Fits: {part.compatibleVehicles.map((v: any) => `${v.make} ${v.model}`).join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats & Actions - Responsive */}
                                            <div className="flex flex-row md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                                                <div className="text-left md:text-right flex-1 md:flex-none">
                                                    <div className="text-xs text-muted-foreground">Stock</div>
                                                    <div className="font-semibold text-sm">{part.stockQuantity} units</div>
                                                </div>

                                                <div className="text-left md:text-right flex-1 md:flex-none">
                                                    <div className="text-xs text-muted-foreground">Price</div>
                                                    <div className="font-semibold text-sm">
                                                        AED {Number(part.sellingPrice).toFixed(2)}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full md:w-auto"
                                                    onClick={() => setSelectedPart(selectedPart?.id === part.id ? null : part)}
                                                >
                                                    {selectedPart?.id === part.id ? 'Hide' : 'Details'}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Enriched Data - Expandable */}
                                        {selectedPart?.id === part.id && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <PartDetails
                                                    partNumber={part.partNumber}
                                                    fullDescription={part.description}
                                                    compatibleVehicles={part.compatibleVehicles}
                                                    category={part.category || undefined}
                                                    specifications={part.specifications}
                                                    oemStatus={part.oemStatus}
                                                    estimatedLifespan={part.estimatedLifespan}
                                                />
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredParts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No parts found</p>
                        </div>
                    )}
                </div>

                {/* Image Zoom Dialog */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    <DialogContent className="bg-transparent border-none max-w-4xl w-full p-0 shadow-none flex justify-center items-center">
                        {selectedImage && (
                            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black/80">
                                <img
                                    src={selectedImage}
                                    alt="Part Preview"
                                    className="max-h-[80vh] w-auto object-contain"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Add Part Dialog - Mobile Responsive */}
            <TooltipProvider>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="bg-elevated-surface border-white/10 max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Part</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    Part Number *
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Unique manufacturer part number (MPN).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    value={newPart.partNumber}
                                    onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                                    placeholder="e.g., 04427-42180"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    Description *
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Standardized English description of the part.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    value={newPart.description}
                                    onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                                    placeholder="e.g., BOOT KIT, FR DRIVE"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="flex items-center gap-2">
                                        Brand
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Manufacturer brand (e.g., Toyota, Nissan).</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        value={newPart.brand}
                                        onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                                        className="bg-deep-space border-white/10 mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2">
                                        Category
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Functional category (e.g., Engine, Brakes).</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        value={newPart.category}
                                        onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                                        placeholder="e.g., Engine"
                                        className="bg-deep-space border-white/10 mt-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="flex items-center gap-2">
                                        Stock Quantity
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Current physical inventory count.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={newPart.stockQuantity}
                                        onChange={(e) => setNewPart({ ...newPart, stockQuantity: parseInt(e.target.value) || 0 })}
                                        className="bg-deep-space border-white/10 mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2">
                                        Unit Price (AED)
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Selling price per unit.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={newPart.unitPrice}
                                        onChange={(e) => setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })}
                                        className="bg-deep-space border-white/10 mt-1.5"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 pt-4">
                                <Button
                                    onClick={handleAddPart}
                                    className="flex-1 gradient-blue glow-blue"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Add Part
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                    className="md:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                AI will automatically enrich this part with vehicle compatibility and images in the background
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </TooltipProvider>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuoteStore, QuoteItem } from "@/lib/store";
import { SmartPaste } from "../SmartPaste";
import { toast } from "sonner";

export function PartsStep() {
    const { items, addItem, updateItem, removeItem } = useQuoteStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAddManual = () => {
        const newItem: QuoteItem = {
            id: `item-${Date.now()}`,
            partNumber: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            total: 0,
        };
        addItem(newItem);
        setEditingId(newItem.id);
    };

    const handleUpdate = (id: string, field: keyof QuoteItem, value: any) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const updates: Partial<QuoteItem> = { [field]: value };

        // Recalculate total
        const quantity = field === "quantity" ? value : item.quantity;
        const unitPrice = field === "unitPrice" ? value : item.unitPrice;
        const discount = field === "discount" ? value : item.discount;

        updates.total = quantity * unitPrice * (1 - discount / 100);

        updateItem(id, updates);
    };

    return (
        <div className="space-y-6">
            {/* Smart Paste */}
            <SmartPaste />

            {/* Manual Add */}
            <div className="flex gap-3">
                <Button onClick={handleAddManual} className="gradient-blue">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Part Manually
                </Button>
            </div>

            {/* Parts List */}
            {items.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold">Quote Items ({items.length})</h3>

                    {items.map((item) => (
                        <Card key={item.id} className="p-4 bg-elevated-surface border-white/10">
                            {editingId === item.id ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Part Number"
                                            value={item.partNumber}
                                            onChange={(e) => handleUpdate(item.id, "partNumber", e.target.value)}
                                            className="bg-deep-space border-white/10"
                                        />
                                        <Input
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => handleUpdate(item.id, "description", e.target.value)}
                                            className="bg-deep-space border-white/10"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdate(item.id, "quantity", parseInt(e.target.value) || 0)}
                                            className="bg-deep-space border-white/10"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price"
                                            value={item.unitPrice}
                                            onChange={(e) => handleUpdate(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                            className="bg-deep-space border-white/10"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Disc %"
                                            value={item.discount}
                                            onChange={(e) => handleUpdate(item.id, "discount", parseFloat(e.target.value) || 0)}
                                            className="bg-deep-space border-white/10"
                                        />
                                        <div className="flex items-center justify-center bg-deep-space border border-white/10 rounded-md px-3">
                                            <span className="text-sm font-semibold">
                                                AED {item.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setEditingId(null)}
                                            className="gradient-blue"
                                        >
                                            Done
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                removeItem(item.id);
                                                setEditingId(null);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono font-semibold text-action-blue">
                                                {item.partNumber}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.description}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} × AED {item.unitPrice.toFixed(2)}
                                            {item.discount > 0 && ` (-${item.discount}%)`}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-semibold">AED {item.total.toFixed(2)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingId(item.id)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                    <p className="text-muted-foreground mb-4">No parts added yet</p>
                    <p className="text-sm text-muted-foreground">
                        Use Smart Paste above or add parts manually
                    </p>
                </div>
            )}
        </div>
    );
}

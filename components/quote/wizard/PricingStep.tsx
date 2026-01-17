"use client";

import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuoteStore } from "@/lib/store";

export function PricingStep() {
    const {
        subtotal,
        taxRate,
        taxAmount,
        discount,
        shippingCost,
        total,
        setTaxRate,
        setDiscount,
        setShippingCost,
    } = useQuoteStore();

    return (
        <div className="space-y-6">
            <TooltipProvider>
                <Card className="p-6 bg-elevated-surface border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Pricing Configuration</h3>

                    <div className="space-y-6">
                        {/* Discount */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="flex items-center gap-2">
                                    Quote Discount
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Global discount applied to the subtotal amount.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <span className="text-sm font-semibold">{discount}%</span>
                            </div>
                            <Slider
                                value={[discount]}
                                onValueChange={(value) => setDiscount(value[0])}
                                max={50}
                                step={1}
                                className="mb-2"
                            />
                            <p className="text-xs text-muted-foreground">
                                Apply a discount to the entire quote
                            </p>
                        </div>

                        {/* Tax Rate */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="flex items-center gap-2">
                                    Tax Rate (VAT)
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Value Added Tax rate. Standard UAE rate is 5%.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <span className="text-sm font-semibold">{taxRate}%</span>
                            </div>
                            <Slider
                                value={[taxRate]}
                                onValueChange={(value) => setTaxRate(value[0])}
                                max={20}
                                step={0.5}
                                className="mb-2"
                            />
                            <p className="text-xs text-muted-foreground">
                                Standard UAE VAT is 5%
                            </p>
                        </div>

                        {/* Shipping Cost */}
                        <div>
                            <Label className="flex items-center gap-2">
                                Shipping Cost (AED)
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Additional cost for logistics and delivery.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                                className="bg-deep-space border-white/10 mt-2"
                            />
                        </div>
                    </div>
                </Card>
            </TooltipProvider>

            {/* Pricing Summary */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">AED {subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Discount ({discount}%)</span>
                            <span className="font-semibold text-green-500">
                                - AED {(subtotal * (discount / 100)).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                        <span className="font-semibold">AED {taxAmount.toFixed(2)}</span>
                    </div>

                    {shippingCost > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-semibold">AED {shippingCost.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="border-t border-white/10 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-bold text-2xl text-action-blue">
                                AED {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Margin Calculator */}
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                <h4 className="font-semibold mb-2 text-blue-400">Profit Margin</h4>
                <p className="text-sm text-muted-foreground">
                    Configure your pricing to maintain healthy profit margins
                </p>
            </Card>
        </div>
    );
}

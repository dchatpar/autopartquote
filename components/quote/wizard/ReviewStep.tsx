"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuoteStore } from "@/lib/store";

export function ReviewStep() {
    const {
        metadata,
        customer,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        shippingCost,
        total,
        terms,
        paymentTerms,
        deliveryTerms,
    } = useQuoteStore();

    const issues = [];
    if (!customer) issues.push("No customer selected");
    if (items.length === 0) issues.push("No items added");
    if (!terms) issues.push("No terms specified");

    return (
        <div className="space-y-6">
            {/* Status */}
            {issues.length > 0 ? (
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-400 mb-2">Issues Found</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {issues.map((issue, i) => (
                                    <li key={i}>• {issue}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="p-4 bg-green-500/10 border-green-500/20">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div>
                            <h4 className="font-semibold text-green-400">Quote Ready</h4>
                            <p className="text-sm text-muted-foreground">
                                All required information is complete
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Quote Summary */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>

                <div className="space-y-4">
                    {/* Metadata */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-1">Quote Number</div>
                        <div className="font-semibold">{metadata.quoteNumber}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Date</div>
                            <div className="font-semibold">{metadata.date}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Valid Until</div>
                            <div className="font-semibold">{metadata.validUntil}</div>
                        </div>
                    </div>

                    {/* Customer */}
                    {customer && (
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Customer</div>
                            <div className="font-semibold">{customer.name}</div>
                            {customer.company && (
                                <div className="text-sm text-muted-foreground">{customer.company}</div>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Items</div>
                        <Badge variant="outline">{items.length} parts</Badge>
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>AED {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount ({discount}%)</span>
                                    <span className="text-green-500">
                                        - AED {(subtotal * (discount / 100)).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                                <span>AED {taxAmount.toFixed(2)}</span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>AED {shippingCost.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-action-blue">AED {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    {terms && (
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Terms & Conditions</div>
                            <div className="text-sm bg-deep-space p-3 rounded border border-white/10">
                                {terms}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

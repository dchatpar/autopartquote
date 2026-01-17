"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuoteStore } from "@/lib/store";
import { FileText } from "lucide-react";

const termsTemplates = [
    {
        name: "Standard Terms",
        content: "Payment due within 30 days of invoice date. All prices in AED. Goods remain property of seller until full payment received.",
    },
    {
        name: "Immediate Payment",
        content: "Payment due upon receipt. All prices in AED. No returns or exchanges without prior authorization.",
    },
    {
        name: "Net 60",
        content: "Payment due within 60 days of invoice date. All prices in AED. Late payments subject to 2% monthly interest.",
    },
];

export function TermsStep() {
    const {
        terms,
        notes,
        paymentTerms,
        deliveryTerms,
        setTerms,
        setNotes,
        setPaymentTerms,
        setDeliveryTerms,
    } = useQuoteStore();

    return (
        <div className="space-y-6">
            {/* Terms & Conditions */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Terms & Conditions</h3>
                    <div className="flex gap-2">
                        {termsTemplates.map((template) => (
                            <Button
                                key={template.name}
                                variant="outline"
                                size="sm"
                                onClick={() => setTerms(template.content)}
                            >
                                <FileText className="h-3 w-3 mr-1" />
                                {template.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <Textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Enter terms and conditions..."
                    className="min-h-[150px] bg-deep-space border-white/10"
                />
            </Card>

            {/* Payment Terms */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <Label className="mb-2 block">Payment Terms</Label>
                <Textarea
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g., 30 days net, 50% upfront..."
                    className="min-h-[80px] bg-deep-space border-white/10"
                />
            </Card>

            {/* Delivery Terms */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <Label className="mb-2 block">Delivery Terms</Label>
                <Textarea
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    placeholder="e.g., Standard delivery 3-5 business days..."
                    className="min-h-[80px] bg-deep-space border-white/10"
                />
            </Card>

            {/* Notes */}
            <Card className="p-6 bg-elevated-surface border-white/10">
                <Label className="mb-2 block">Additional Notes</Label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information for the customer..."
                    className="min-h-[100px] bg-deep-space border-white/10"
                />
            </Card>
        </div>
    );
}

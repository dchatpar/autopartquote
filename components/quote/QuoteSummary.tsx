"use client";

import { motion } from "framer-motion";
import { FileText, DollarSign, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuoteStore } from "@/lib/store";

export function QuoteSummary() {
    const { items, subtotal, total } = useQuoteStore();

    const stats = [
        {
            label: "Items",
            value: items.length,
            icon: Package,
            color: "text-action-blue",
        },
        {
            label: "Subtotal",
            value: `AED ${subtotal.toFixed(2)}`,
            icon: DollarSign,
            color: "text-success-green",
        },
        {
            label: "Total",
            value: `AED ${total.toFixed(2)}`,
            icon: FileText,
            color: "text-action-blue",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="p-4 bg-elevated-surface border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                <div className="text-lg font-bold">{stat.value}</div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

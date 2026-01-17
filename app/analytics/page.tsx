"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, FileText, Users, Package, ShoppingCart, type LucideIcon } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";

interface StatCard {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    trend: "up" | "down";
}

const stats: StatCard[] = [
    {
        title: "Total Revenue",
        value: "AED 1,234,567",
        change: "+12.5%",
        icon: DollarSign,
        trend: "up",
    },
    {
        title: "Total Quotes",
        value: "156",
        change: "+8.2%",
        icon: FileText,
        trend: "up",
    },
    {
        title: "Active Customers",
        value: "48",
        change: "+5.1%",
        icon: Users,
        trend: "up",
    },
    {
        title: "Parts Sold",
        value: "12,456",
        change: "+15.3%",
        icon: Package,
        trend: "up",
    },
];

export default function AnalyticsPage() {
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
                    <div>
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-sm text-muted-foreground">
                            Track your business performance and insights
                        </p>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-4 bg-elevated-surface border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                                            <stat.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div
                                            className={`text-sm font-semibold ${stat.trend === "up" ? "text-success-green" : "text-danger-red"
                                                }`}
                                        >
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.title}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <h3 className="font-semibold mb-4">Revenue Trend</h3>
                            <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-deep-space">
                                <div className="text-center text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                                    <p>Chart visualization coming soon</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <h3 className="font-semibold mb-4">Top Selling Parts</h3>
                            <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-deep-space">
                                <div className="text-center text-muted-foreground">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                                    <p>Chart visualization coming soon</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <h3 className="font-semibold mb-4">Customer Growth</h3>
                            <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-deep-space">
                                <div className="text-center text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2" />
                                    <p>Chart visualization coming soon</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <h3 className="font-semibold mb-4">Quote Conversion Rate</h3>
                            <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-deep-space">
                                <div className="text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-2" />
                                    <p>Chart visualization coming soon</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

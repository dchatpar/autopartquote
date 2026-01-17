"use client";

import { motion } from "framer-motion";
import {
    Home,
    FileText,
    Users,
    Settings,
    BarChart3,
    Package,
    ChevronLeft,
    ChevronRight,
    Database,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", icon: Home, href: "/" },
    { name: "Quotes", icon: FileText, href: "/quotes" },
    { name: "Customers", icon: Users, href: "/customers" },
    { name: "Parts Catalog", icon: Package, href: "/parts" },
    { name: "Master Catalog", icon: Database, href: "/master-catalog" },
    { name: "Analytics", icon: BarChart3, href: "/analytics" },
    { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
                "glass border-r border-white/10 flex flex-col transition-all duration-300",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {navigation.map((item, index) => (
                    <motion.a
                        key={item.name}
                        href={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth",
                            "hover:bg-white/5 hover:glow-blue cursor-pointer",
                            "text-muted-foreground hover:text-white"
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                            <span className="text-sm font-medium">{item.name}</span>
                        )}
                    </motion.a>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-white/10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-center"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </motion.div>
    );
}

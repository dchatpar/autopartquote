"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Mail, Phone, Building, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Customer {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    country: string;
    code: string;
    zohoId?: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Form state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "UAE"
    });

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/customers?q=${searchTerm}`);
            const data = await res.json();
            if (data.customers) {
                setCustomers(data.customers);
            }
        } catch (error) {
            toast.error("Failed to load customers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(fetchCustomers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/zoho/sync-customers", { method: "POST" });
            const result = await res.json();
            if (result.success) {
                toast.success(`Synced: ${result.results.created} created, ${result.results.updated} updated`);
                fetchCustomers();
            } else {
                toast.error("Sync failed");
            }
        } catch (error) {
            toast.error("Sync error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.email) {
            toast.error("Name and Email are required");
            return;
        }

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCustomer)
            });

            if (res.ok) {
                toast.success("Customer created");
                setIsAddOpen(false);
                setNewCustomer({ name: "", email: "", phone: "", company: "", country: "UAE" });
                fetchCustomers();
            } else {
                toast.error("Failed to create customer");
            }
        } catch (error) {
            toast.error("Error creating customer");
        }
    };

    return (
        <TooltipProvider>
            <div className="h-screen flex bg-deep-space text-foreground">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass border-b border-white/10 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Customers</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage your customer database
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                                    {isSyncing ? "Syncing..." : "Sync Zoho"}
                                </Button>

                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 gradient-blue glow-blue">
                                            <Plus className="h-4 w-4" />
                                            New Customer
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-elevated-surface border-white/10 text-foreground">
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Name *</Label>
                                                <Input
                                                    value={newCustomer.name}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                    className="bg-deep-space border-white/10"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Email *</Label>
                                                <Input
                                                    type="email"
                                                    value={newCustomer.email}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                                    className="bg-deep-space border-white/10"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Company</Label>
                                                <Input
                                                    value={newCustomer.company}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                                                    className="bg-deep-space border-white/10"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Phone</Label>
                                                <Input
                                                    value={newCustomer.phone}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                    className="bg-deep-space border-white/10"
                                                />
                                            </div>
                                            <Button onClick={handleCreateCustomer} className="w-full gradient-blue">
                                                Create Customer
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mt-4 relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-elevated-surface border-white/10"
                            />
                        </div>
                    </motion.div>

                    {/* Customers Grid */}
                    <div className="flex-1 overflow-auto p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-action-blue" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {customers.map((customer, index) => (
                                    <motion.div
                                        key={customer.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="p-4 bg-elevated-surface border-white/10 hover:border-action-blue/30 transition-smooth">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold">{customer.name}</h3>
                                                    {customer.company && (
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                            <Building className="h-3 w-3" />
                                                            {customer.company}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {customer.country}
                                                    </Badge>
                                                    {customer.zohoId && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                                    Zoho
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Synced with Zoho CRM</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        <span className="truncate">{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-danger-red">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {!isLoading && customers.length === 0 && (
                            <div className="text-center py-12">
                                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No customers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

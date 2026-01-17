"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    country: string;
    vatRate: number;
    currency: string;
}

interface CustomerSelectorProps {
    onSelect: (customer: Customer) => void;
    selectedCustomer?: Customer;
}

export function CustomerSelector({ onSelect, selectedCustomer }: CustomerSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        country: "UAE",
        currency: "AED",
    });

    const handleCreateCustomer = () => {
        if (!newCustomer.name) {
            toast.error("Customer name is required");
            return;
        }

        const customer: Customer = {
            id: `cust-${Date.now()}`,
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            country: newCustomer.country,
            vatRate: newCustomer.country === 'UAE' ? 0.05 : 0.15,
            currency: newCustomer.currency,
        };

        onSelect(customer);
        setIsOpen(false);
        toast.success(`Customer "${customer.name}" created`);

        // Reset form
        setNewCustomer({
            name: "",
            email: "",
            phone: "",
            country: "UAE",
            currency: "AED",
        });
    };

    return (
        <div className="flex items-center gap-3">
            {selectedCustomer ? (
                <Card className="flex-1 p-3 bg-elevated-surface border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{selectedCustomer.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                                {selectedCustomer.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {selectedCustomer.email}
                                    </span>
                                )}
                                {selectedCustomer.country && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {selectedCustomer.country}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(true)}
                        >
                            Change
                        </Button>
                    </div>
                </Card>
            ) : (
                <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setIsOpen(true)}
                >
                    <UserPlus className="h-4 w-4" />
                    Select Customer
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-elevated-surface border-white/10">
                    <DialogHeader>
                        <DialogTitle>Customer Selection</DialogTitle>
                        <DialogDescription>
                            Search for an existing customer or create a new one
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-deep-space border-white/10"
                            />
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <h3 className="text-sm font-semibold mb-3">Create New Customer</h3>

                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="name">Customer Name *</Label>
                                    <Input
                                        id="name"
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className="bg-deep-space border-white/10"
                                        placeholder="Enter customer name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                            className="bg-deep-space border-white/10"
                                            placeholder="customer@example.com"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            className="bg-deep-space border-white/10"
                                            placeholder="+971 XX XXX XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Select
                                            value={newCustomer.country}
                                            onValueChange={(value) => setNewCustomer({ ...newCustomer, country: value })}
                                        >
                                            <SelectTrigger className="bg-deep-space border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UAE">UAE (5% VAT)</SelectItem>
                                                <SelectItem value="KSA">KSA (15% VAT)</SelectItem>
                                                <SelectItem value="UK">UK (20% VAT)</SelectItem>
                                                <SelectItem value="India">India (18% VAT)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select
                                            value={newCustomer.currency}
                                            onValueChange={(value) => setNewCustomer({ ...newCustomer, currency: value })}
                                        >
                                            <SelectTrigger className="bg-deep-space border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AED">AED</SelectItem>
                                                <SelectItem value="SAR">SAR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCreateCustomer}
                                    className="w-full gradient-blue glow-blue"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Customer
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

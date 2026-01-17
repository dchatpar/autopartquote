"use client";

import { useState } from "react";
import { Search, Plus, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuoteStore, Customer } from "@/lib/store";
import { toast } from "sonner";

const mockCustomers: Customer[] = [
    {
        id: "1",
        name: "Ahmed Al Mansouri",
        email: "ahmed@example.com",
        phone: "+971 50 123 4567",
        company: "Al Mansouri Trading",
        address: "Dubai, UAE",
        vatNumber: "AE123456789",
    },
    {
        id: "2",
        name: "Fatima Hassan",
        email: "fatima@example.com",
        phone: "+971 55 987 6543",
        company: "Hassan Motors",
        address: "Abu Dhabi, UAE",
    },
];

export function CustomerStep() {
    const { customer, setCustomer } = useQuoteStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer>({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        vatNumber: "",
    });

    const filteredCustomers = mockCustomers.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectCustomer = (selectedCustomer: Customer) => {
        setCustomer(selectedCustomer);
        toast.success(`Selected ${selectedCustomer.name}`);
    };

    const handleCreateCustomer = () => {
        if (!newCustomer.name || !newCustomer.email) {
            toast.error("Name and email are required");
            return;
        }

        setCustomer(newCustomer);
        setIsCreatingNew(false);
        toast.success("Customer created successfully");
    };

    if (isCreatingNew) {
        return (
            <TooltipProvider>
                <Card className="p-6 bg-elevated-surface border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Create New Customer</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    Name *
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>The full legal name of the customer or contact person.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder="Customer name"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2">
                                    Email *
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Primary email address for sending quotes and invoices.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    Phone
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Contact phone number with country code (e.g., +971...).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="+971 50 123 4567"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2">
                                    Company
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Business or organization name (if applicable).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    value={newCustomer.company}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                                    placeholder="Company name"
                                    className="bg-deep-space border-white/10 mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                Address
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Full billing/shipping address including city and country.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                placeholder="Full address"
                                className="bg-deep-space border-white/10 mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                VAT Number
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground hover:text-white transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tax Registration Number (TRN) for VAT calculation purposes.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                value={newCustomer.vatNumber}
                                onChange={(e) => setNewCustomer({ ...newCustomer, vatNumber: e.target.value })}
                                placeholder="AE123456789"
                                className="bg-deep-space border-white/10 mt-1.5"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleCreateCustomer} className="flex-1 gradient-blue">
                                Create Customer
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreatingNew(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            </TooltipProvider>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search & Create */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-elevated-surface border-white/10"
                    />
                </div>
                <Button onClick={() => setIsCreatingNew(true)} className="gradient-blue">
                    <UserPlus className="h-4 w-4 mr-2" />
                    New
                </Button>
            </div>

            {/* Selected Customer */}
            {customer && (
                <Card className="p-4 bg-green-500/10 border-green-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-green-400">Selected Customer</h4>
                            <p className="text-sm">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCustomer(null)}>
                            Change
                        </Button>
                    </div>
                </Card>
            )}

            {/* Customer List */}
            <div className="space-y-2">
                {filteredCustomers.map((c) => (
                    <Card
                        key={c.id}
                        className={`p-4 bg-elevated-surface border-white/10 cursor-pointer hover:border-action-blue/30 transition-all ${customer?.id === c.id ? "border-action-blue" : ""
                            }`}
                        onClick={() => handleSelectCustomer(c)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">{c.name}</h4>
                                {c.company && (
                                    <p className="text-sm text-muted-foreground">{c.company}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {c.email} • {c.phone}
                                </p>
                            </div>
                            {customer?.id === c.id && (
                                <div className="h-6 w-6 rounded-full bg-action-blue flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No customers found</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingNew(true)}
                        className="mt-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Customer
                    </Button>
                </div>
            )}
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Database, Key, Globe } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
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
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-muted-foreground">
                            Configure your application preferences
                        </p>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl space-y-6">
                        {/* Company Settings */}
                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                                    <SettingsIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Company Information</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Update your company details
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="company-name">Company Name</Label>
                                        <Input
                                            id="company-name"
                                            defaultValue="Dakshin Trading"
                                            className="bg-deep-space border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="company-email">Email</Label>
                                        <Input
                                            id="company-email"
                                            type="email"
                                            defaultValue="support@dakshintrading.com"
                                            className="bg-deep-space border-white/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="company-address">Address</Label>
                                    <Input
                                        id="company-address"
                                        defaultValue="Dubai, UAE"
                                        className="bg-deep-space border-white/10"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Regional Settings */}
                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Regional Settings</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure default region and currency
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="default-region">Default Region</Label>
                                    <Select defaultValue="UAE">
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
                                    <Label htmlFor="default-currency">Default Currency</Label>
                                    <Select defaultValue="AED">
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
                        </Card>

                        {/* Zoho Integration */}
                        <Card className="p-6 bg-elevated-surface border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                                    <Key className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Zoho Books Integration</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure your Zoho Books API credentials
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="zoho-client-id">Client ID</Label>
                                    <Input
                                        id="zoho-client-id"
                                        type="password"
                                        placeholder="Enter Zoho Client ID"
                                        className="bg-deep-space border-white/10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="zoho-client-secret">Client Secret</Label>
                                    <Input
                                        id="zoho-client-secret"
                                        type="password"
                                        placeholder="Enter Zoho Client Secret"
                                        className="bg-deep-space border-white/10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="zoho-org-id">Organization ID</Label>
                                    <Input
                                        id="zoho-org-id"
                                        placeholder="Enter Zoho Organization ID"
                                        className="bg-deep-space border-white/10"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button className="gradient-blue glow-blue">
                                Save Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

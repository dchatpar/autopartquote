"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Car, Wrench, Info, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VehicleCompatibility {
    make: string;
    model: string;
    years: string;
    engine?: string;
    trim?: string;
}

interface PartDetailsProps {
    partNumber: string;
    fullDescription?: string;
    compatibleVehicles?: VehicleCompatibility[];
    category?: string;
    subcategory?: string;
    specifications?: Record<string, string>;
    oemStatus?: string;
    estimatedLifespan?: string;
    installationDifficulty?: string;
    commonIssues?: string;
    maintenanceNotes?: string;
    warrantyInfo?: string;
}

export function PartDetails({
    partNumber,
    fullDescription,
    compatibleVehicles = [],
    category,
    subcategory,
    specifications = {},
    oemStatus,
    estimatedLifespan,
    installationDifficulty,
    commonIssues,
    maintenanceNotes,
    warrantyInfo,
}: PartDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!fullDescription && compatibleVehicles.length === 0) {
        return null;
    }

    return (
        <Card className="p-4 bg-elevated-surface border-white/10 mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-sm">Part Details & Vehicle Compatibility</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-4">
                            {/* Full Description */}
                            {fullDescription && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Description</h4>
                                    <p className="text-sm">{fullDescription}</p>
                                </div>
                            )}

                            {/* Category & Status */}
                            <div className="flex flex-wrap gap-2">
                                {category && (
                                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20">
                                        {category} {subcategory && `• ${subcategory}`}
                                    </Badge>
                                )}
                                {oemStatus && (
                                    <Badge
                                        variant="outline"
                                        className={oemStatus === 'OEM' ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}
                                    >
                                        {oemStatus}
                                    </Badge>
                                )}
                                {installationDifficulty && (
                                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20">
                                        {installationDifficulty} Install
                                    </Badge>
                                )}
                            </div>

                            {/* Compatible Vehicles */}
                            {compatibleVehicles.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Car className="h-4 w-4 text-blue-400" />
                                        <h4 className="text-xs font-semibold text-muted-foreground">Compatible Vehicles</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {compatibleVehicles.map((vehicle, index) => (
                                            <div key={index} className="p-2 rounded bg-deep-space border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{vehicle.make} {vehicle.model}</span>
                                                    <span className="text-xs text-muted-foreground">({vehicle.years})</span>
                                                </div>
                                                {vehicle.engine && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Engine: {vehicle.engine}
                                                    </div>
                                                )}
                                                {vehicle.trim && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Trim: {vehicle.trim}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Specifications */}
                            {Object.keys(specifications).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wrench className="h-4 w-4 text-blue-400" />
                                        <h4 className="text-xs font-semibold text-muted-foreground">Specifications</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(specifications).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="text-xs">
                                                    <span className="text-muted-foreground">{key}:</span>{' '}
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lifespan & Warranty */}
                            {(estimatedLifespan || warrantyInfo) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {estimatedLifespan && (
                                        <div className="p-2 rounded bg-deep-space border border-white/5">
                                            <div className="text-xs text-muted-foreground">Estimated Lifespan</div>
                                            <div className="text-sm font-medium">{estimatedLifespan}</div>
                                        </div>
                                    )}
                                    {warrantyInfo && (
                                        <div className="p-2 rounded bg-deep-space border border-white/5">
                                            <div className="text-xs text-muted-foreground">Warranty</div>
                                            <div className="text-sm font-medium">{warrantyInfo}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common Issues */}
                            {commonIssues && (
                                <div className="p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-semibold text-yellow-400 mb-1">Common Issues</div>
                                            <div className="text-xs text-muted-foreground">{commonIssues}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Maintenance Notes */}
                            {maintenanceNotes && (
                                <div className="p-3 rounded bg-blue-500/5 border border-blue-500/20">
                                    <div className="text-xs font-semibold text-blue-400 mb-1">Maintenance Notes</div>
                                    <div className="text-xs text-muted-foreground">{maintenanceNotes}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

"use client";

import { motion } from "framer-motion";
import { User, Package, DollarSign, FileText, CheckCircle } from "lucide-react";
import { useQuoteStore } from "@/lib/store";
import { CustomerStep } from "./wizard/CustomerStep";
import { PartsStep } from "./wizard/PartsStep";
import { PricingStep } from "./wizard/PricingStep";
import { TermsStep } from "./wizard/TermsStep";
import { ReviewStep } from "./wizard/ReviewStep";

const steps = [
    { id: 0, name: "Customer", icon: User, component: CustomerStep },
    { id: 1, name: "Parts", icon: Package, component: PartsStep },
    { id: 2, name: "Pricing", icon: DollarSign, component: PricingStep },
    { id: 3, name: "Terms", icon: FileText, component: TermsStep },
    { id: 4, name: "Review", icon: CheckCircle, component: ReviewStep },
];

export function QuoteWizard() {
    const { currentStep } = useQuoteStore();
    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="h-full flex flex-col">
            {/* Step Indicator */}
            <div className="p-4 md:p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${index === currentStep
                                            ? "bg-action-blue text-white scale-110"
                                            : index < currentStep
                                                ? "bg-green-500 text-white"
                                                : "bg-white/10 text-muted-foreground"
                                        }`}
                                >
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span
                                    className={`text-xs mt-2 hidden md:block ${index === currentStep ? "text-action-blue font-semibold" : "text-muted-foreground"
                                        }`}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 transition-all ${index < currentStep ? "bg-green-500" : "bg-white/10"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <h3 className="text-lg md:text-xl font-semibold">
                        {steps[currentStep].name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <CurrentStepComponent />
                </motion.div>
            </div>
        </div>
    );
}

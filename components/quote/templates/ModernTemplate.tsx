"use client";

import { motion } from "framer-motion";
import { useQuoteStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function ModernTemplate() {
    const {
        metadata,
        customer,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        shippingCost,
        total,
        terms,
        notes,
    } = useQuoteStore();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden"
            style={{ minHeight: '1100px', width: '210mm' }}
        >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dakshin Trading</h1>
                        <p className="text-blue-100">Enterprise Auto Parts</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">QUOTATION</div>
                        <div className="text-2xl font-bold">{metadata.quoteNumber}</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Customer Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-3">Bill To</h3>
                        {customer ? (
                            <div className="space-y-1 text-sm">
                                <div className="font-semibold text-gray-900">{customer.name}</div>
                                {customer.company && <div className="text-gray-600">{customer.company}</div>}
                                <div className="text-gray-600">{customer.email}</div>
                                <div className="text-gray-600">{customer.phone}</div>
                                {customer.address && <div className="text-gray-600 mt-2">{customer.address}</div>}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">No customer selected</div>
                        )}
                    </div>

                    {/* Quote Details */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-3">Quote Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold">{metadata.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valid Until:</span>
                                <span className="font-semibold">{metadata.validUntil}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge className="bg-blue-500">{metadata.status}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Items</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                <tr>
                                    <th className="text-left p-3 text-sm font-semibold">#</th>
                                    <th className="text-left p-3 text-sm font-semibold">Part Number</th>
                                    <th className="text-left p-3 text-sm font-semibold">Description</th>
                                    <th className="text-right p-3 text-sm font-semibold">Qty</th>
                                    <th className="text-right p-3 text-sm font-semibold">Price</th>
                                    <th className="text-right p-3 text-sm font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="p-3 text-sm">{index + 1}</td>
                                        <td className="p-3 text-sm font-mono font-semibold text-blue-600">
                                            {item.partNumber}
                                        </td>
                                        <td className="p-3 text-sm text-gray-700">{item.description}</td>
                                        <td className="p-3 text-sm text-right">{item.quantity}</td>
                                        <td className="p-3 text-sm text-right">
                                            AED {item.unitPrice.toFixed(2)}
                                            {item.discount > 0 && (
                                                <span className="text-green-600 text-xs ml-1">(-{item.discount}%)</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-right font-semibold">
                                            AED {item.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-80 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">AED {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount ({discount}%):</span>
                                    <span className="font-semibold text-green-600">
                                        - AED {(subtotal * (discount / 100)).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax ({taxRate}%):</span>
                                <span className="font-semibold">AED {taxAmount.toFixed(2)}</span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-semibold">AED {shippingCost.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t-2 border-gray-300 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        AED {total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms & Notes */}
                {(terms || notes) && (
                    <div className="space-y-4">
                        {terms && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{terms}</p>
                            </div>
                        )}
                        {notes && (
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Notes</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 mt-8">
                <div className="text-center text-sm">
                    <p>Thank you for your business!</p>
                    <p className="text-gray-400 mt-1">Dakshin Trading Enterprise • Dubai, UAE</p>
                </div>
            </div>
        </motion.div>
    );
}

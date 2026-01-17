"use client";

import { useQuoteStore } from "@/lib/store";

export function ProfessionalTemplate() {
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
        <div
            className="bg-white text-gray-900"
            style={{ minHeight: '1100px', width: '210mm', padding: '20mm' }}
        >
            {/* Header */}
            <div className="border-b-4 border-gray-800 pb-6 mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">DAKSHIN TRADING</h1>
                        <p className="text-gray-600 mt-1">Enterprise Auto Parts Supply</p>
                        <p className="text-sm text-gray-500 mt-2">Dubai, United Arab Emirates</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">QUOTATION</div>
                        <div className="text-2xl font-bold text-gray-900">{metadata.quoteNumber}</div>
                        <div className="text-sm text-gray-600 mt-2">{metadata.date}</div>
                    </div>
                </div>
            </div>

            {/* Customer & Quote Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        Bill To
                    </h3>
                    {customer ? (
                        <div className="space-y-1">
                            <div className="font-semibold text-gray-900">{customer.name}</div>
                            {customer.company && <div className="text-gray-700">{customer.company}</div>}
                            <div className="text-gray-600 text-sm">{customer.email}</div>
                            <div className="text-gray-600 text-sm">{customer.phone}</div>
                            {customer.address && (
                                <div className="text-gray-600 text-sm mt-2">{customer.address}</div>
                            )}
                            {customer.vatNumber && (
                                <div className="text-gray-600 text-sm">VAT: {customer.vatNumber}</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400">No customer selected</div>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        Quote Details
                    </h3>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="py-1 text-gray-600">Quote Date:</td>
                                <td className="py-1 text-right font-semibold">{metadata.date}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Valid Until:</td>
                                <td className="py-1 text-right font-semibold">{metadata.validUntil}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Status:</td>
                                <td className="py-1 text-right font-semibold uppercase">{metadata.status}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="text-left p-3 text-sm font-semibold">#</th>
                            <th className="text-left p-3 text-sm font-semibold">Part Number</th>
                            <th className="text-left p-3 text-sm font-semibold">Description</th>
                            <th className="text-right p-3 text-sm font-semibold">Qty</th>
                            <th className="text-right p-3 text-sm font-semibold">Unit Price</th>
                            <th className="text-right p-3 text-sm font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="p-3 text-sm">{index + 1}</td>
                                <td className="p-3 text-sm font-mono font-semibold">{item.partNumber}</td>
                                <td className="p-3 text-sm">{item.description}</td>
                                <td className="p-3 text-sm text-right">{item.quantity}</td>
                                <td className="p-3 text-sm text-right">
                                    AED {item.unitPrice.toFixed(2)}
                                    {item.discount > 0 && (
                                        <div className="text-xs text-green-600">(-{item.discount}%)</div>
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

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-80">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 text-gray-700">Subtotal:</td>
                                <td className="py-2 text-right font-semibold">AED {subtotal.toFixed(2)}</td>
                            </tr>
                            {discount > 0 && (
                                <tr className="border-b border-gray-200">
                                    <td className="py-2 text-gray-700">Discount ({discount}%):</td>
                                    <td className="py-2 text-right font-semibold text-green-600">
                                        - AED {(subtotal * (discount / 100)).toFixed(2)}
                                    </td>
                                </tr>
                            )}
                            <tr className="border-b border-gray-200">
                                <td className="py-2 text-gray-700">Tax ({taxRate}%):</td>
                                <td className="py-2 text-right font-semibold">AED {taxAmount.toFixed(2)}</td>
                            </tr>
                            {shippingCost > 0 && (
                                <tr className="border-b border-gray-200">
                                    <td className="py-2 text-gray-700">Shipping:</td>
                                    <td className="py-2 text-right font-semibold">AED {shippingCost.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="border-t-2 border-gray-800">
                                <td className="py-3 text-lg font-bold">TOTAL:</td>
                                <td className="py-3 text-right text-xl font-bold">AED {total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Terms & Notes */}
            {(terms || notes) && (
                <div className="space-y-6 border-t border-gray-300 pt-6">
                    {terms && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Terms & Conditions
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{terms}</p>
                        </div>
                    )}
                    {notes && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Notes
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-300 mt-12 pt-6 text-center text-sm text-gray-600">
                <p>Thank you for your business</p>
                <p className="mt-1">Dakshin Trading Enterprise • Dubai, UAE</p>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailQuoteProps {
    quoteData: {
        referenceNumber: string;
        customerName: string;
        grandTotal: number;
        currency: string;
    };
}

export function EmailQuote({ quoteData }: EmailQuoteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState(
        `Quote ${quoteData.referenceNumber} from Dakshin Trading`
    );
    const [message, setMessage] = useState(
        `Dear ${quoteData.customerName},\n\nPlease find attached your quote ${quoteData.referenceNumber} for ${quoteData.currency} ${quoteData.grandTotal.toLocaleString()}.\n\nBest regards,\nDakshin Trading Team`
    );
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject,
                    message,
                    attachmentName: `Quote_${quoteData.referenceNumber}.pdf`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            const result = await response.json();
            toast.success(`Quote emailed to ${email}`);
            setIsOpen(false);
            setEmail("");
        } catch (error) {
            console.error('Email error:', error);
            toast.error("Failed to send email");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email Quote
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-elevated-surface border-white/10 max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Email Quote</DialogTitle>
                    <DialogDescription>
                        Send quote {quoteData.referenceNumber} to customer
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Recipient Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="customer@example.com"
                            className="bg-deep-space border-white/10"
                        />
                    </div>

                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-deep-space border-white/10"
                        />
                    </div>

                    <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setMessage(e.target.value)
                            }
                            rows={6}
                            className="bg-deep-space border-white/10"
                        />
                    </div>

                    <div className="p-3 rounded-lg bg-deep-space border border-white/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <FileText className="h-4 w-4" />
                            <span>Attachment</span>
                        </div>
                        <div className="text-sm">
                            Quote_{quoteData.referenceNumber}.pdf
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            onClick={handleSend}
                            disabled={isSending}
                            className="flex-1 gradient-blue glow-blue"
                        >
                            {isSending ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                    </motion.div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Email
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

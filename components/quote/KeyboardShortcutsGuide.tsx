"use client";

import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import { Card } from "@/components/ui/card";

const shortcuts = [
    { keys: ["Cmd", "K"], description: "Global search" },
    { keys: ["Cmd", "S"], description: "Save quote" },
    { keys: ["Cmd", "E"], description: "Export PDF" },
    { keys: ["Cmd", "Shift", "Z"], description: "Sync to Zoho" },
    { keys: ["Esc"], description: "Clear selection" },
];

export function KeyboardShortcutsGuide() {
    return (
        <Card className="p-4 bg-elevated-surface border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <Keyboard className="h-4 w-4 text-action-blue" />
                <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
            </div>

            <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between text-xs"
                    >
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                                <kbd
                                    key={i}
                                    className="px-2 py-1 rounded bg-deep-space border border-white/10 font-mono text-xs"
                                >
                                    {key}
                                </kbd>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}

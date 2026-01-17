import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { QueuePanel } from "@/components/queue/QueuePanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dakshin Trading - Enterprise Quoting Engine",
  description: "Professional auto parts quoting system for Dakshin Trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${barlowCondensed.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <QueuePanel />
      </body>
    </html>
  );
}

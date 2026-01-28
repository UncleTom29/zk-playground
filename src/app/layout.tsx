import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "ZK-Playground - Interactive Zero-Knowledge Circuit IDE",
  description: "Write, compile, prove, and deploy Zero-Knowledge circuits with Noir. Browser-based IDE with one-click Solana deployment.",
  keywords: ["ZK", "Zero Knowledge", "Noir", "Solana", "Blockchain", "Cryptography", "IDE", "Playground"],
  authors: [{ name: "ZK-Playground Team" }],
  openGraph: {
    title: "ZK-Playground",
    description: "Interactive browser-based environment for learning and testing Zero-Knowledge circuits with Noir",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZK-Playground",
    description: "Interactive browser-based environment for learning and testing Zero-Knowledge circuits with Noir",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1E1E1E" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}

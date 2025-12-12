import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

// Force all routes to be dynamically rendered to avoid SSG issues with React contexts
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Fraunces - warm, editorial serif for headlines and display text
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // Optical sizing and soft edges for warmth
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Empathy Ledger | Indigenous Stories & Cultural Wisdom",
  description: "A culturally respectful platform for preserving and sharing Indigenous stories, wisdom, and cultural heritage through digital storytelling.",
  keywords: ["Indigenous stories", "cultural preservation", "storytelling", "cultural heritage", "oral history"],
  authors: [{ name: "Empathy Ledger Team" }],
  openGraph: {
    title: "Empathy Ledger | Indigenous Stories & Cultural Wisdom",
    description: "A culturally respectful platform for preserving and sharing Indigenous stories, wisdom, and cultural heritage.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empathy Ledger | Indigenous Stories & Cultural Wisdom",
    description: "A culturally respectful platform for preserving and sharing Indigenous stories.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

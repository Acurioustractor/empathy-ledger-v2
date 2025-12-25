import type { Metadata, Viewport } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

// Force all routes to be dynamically rendered to avoid SSG issues with React contexts
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Empathy Ledger | Indigenous Stories & Cultural Wisdom",
  description: "A culturally respectful platform for preserving and sharing Indigenous stories, wisdom, and cultural heritage through digital storytelling.",
  keywords: ["Indigenous stories", "cultural preservation", "storytelling", "cultural heritage", "oral history"],
  authors: [{ name: "Empathy Ledger Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Empathy Ledger",
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#96643a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

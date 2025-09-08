import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/context/auth.context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

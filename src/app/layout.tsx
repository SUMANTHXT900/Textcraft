import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/inter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Character Counter - Real-time Text Analysis Tool",
  description: "A powerful, real-time text analysis tool with character/word counting, platform-specific limits, and advanced text manipulation features. Privacy-first, client-side only processing.",
  keywords: ["character counter", "word counter", "text analysis", "twitter character limit", "instagram caption limit", "text tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

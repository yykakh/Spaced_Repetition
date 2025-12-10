import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// UPDATED: Metadata adapted for your "SpaceLearn" app
export const metadata: Metadata = {
  title: "SpaceLearn - Master New Concepts",
  description: "A modern Spaced Repetition System (SRS) built with Next.js to help you learn effectively.",
  keywords: ["Spaced Repetition", "Learning", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Developer" }], // You can put your name here
  // Removed the Z.ai icon and OpenGraph links
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

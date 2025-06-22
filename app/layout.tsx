import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VisitsProvider } from "@/contexts/VisitsContext";
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
  title: "Traveled - Track Your Adventures",
  description: "A modern travel tracking app to visualize and record your journeys around the world",
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
        <VisitsProvider>
          {children}
        </VisitsProvider>
      </body>
    </html>
  );
}

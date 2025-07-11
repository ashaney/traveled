import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import { SupabaseVisitsProvider } from '@/contexts/SupabaseVisitsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
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
  icons: {
    icon: '/logo_only.png',
    shortcut: '/logo_only.png',
    apple: '/logo_only.png',
  },
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
        <ThemeProvider>
          <AuthProvider>
            <SupabaseVisitsProvider>
              {children}
              <Toaster />
            </SupabaseVisitsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
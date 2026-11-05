import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { AlertModalProvider } from "@/components/ui/AlertModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GW App Download Portal",
  description: "Official Android APK Distribution Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AlertModalProvider>
          <RouteTransition>{children}</RouteTransition>
        </AlertModalProvider>
      </body>
    </html>
  );
}

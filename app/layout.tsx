import "./globals.css";

import type { Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { NotificationProvider } from "./components/ui/notifications";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} dark antialiased`}
      >
        <Providers>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}

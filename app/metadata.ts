import type { Metadata, Viewport } from "next";

const description =
  "Visual Artifact Studio is a revolutionary no-code platform that combines the visual design power of Figma, the live coding environment of CodeSandbox, and cutting-edge AI to create interactive React components from simple text descriptions. Think Figma meets CodeSandbox meets AI.";

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

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://visual-artifact-studio.vercel.app",
  ),
  title: {
    default: "Visual Artifact Studio - AI-Powered React Component Builder",
    template: "%s | Visual Artifact Studio",
  },
  description: description,
  keywords: [
    "visual builder",
    "react components",
    "ai code generation",
    "no-code platform",
    "drag and drop",
    "component builder",
    "figma alternative",
    "codesandbox alternative",
    "ai-powered design",
    "natural language to code",
    "interactive components",
    "react generator",
    "tailwind css",
    "typescript",
    "next.js",
    "visual design tool",
    "component library",
    "code export",
  ],
  authors: [
    {
      name: "AI Mavericks Team",
      url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://visual-artifact-studio.vercel.app",
    },
  ],
  creator: "AI Mavericks Team",
  publisher: "Visual Artifact Studio",
  category: "Technology",
  classification: "Development Tools Platform",
  openGraph: {
    title: "Visual Artifact Studio - AI-Powered React Component Builder",
    description: description,
    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://visual-artifact-studio.vercel.app",
    siteName: "Visual Artifact Studio",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://visual-artifact-studio.vercel.app"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Visual Artifact Studio - AI-Powered React Component Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Artifact Studio - AI-Powered React Component Builder",
    description: description,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://visual-artifact-studio.vercel.app"}/twitter-image.png`,
        alt: "Visual Artifact Studio - AI-Powered React Component Builder",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Optimized PWA metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Visual Artifact Studio",
    startupImage: [
      {
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
        url: "/icons/apple-splash-1170x2532.png",
      },
      {
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
        url: "/icons/apple-splash-1179x2556.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  applicationName: "Visual Artifact Studio",
  // Other PWA metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

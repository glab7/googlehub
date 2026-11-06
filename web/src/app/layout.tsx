import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";

import { Providers } from "@/components/site/providers";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "Orbita · Business Apps",
  description: "Orbita: all the apps your business needs, in one platform.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0812" },
    { media: "(prefers-color-scheme: light)", color: "#f3eef6" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

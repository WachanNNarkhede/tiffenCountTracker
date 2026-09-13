import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "protinPro — tiffin tracker",
  description:
    "Track your evening tiffin deliveries: what came, what didn't, and how many meals are left in your plan.",
};

export const viewport: Viewport = {
  themeColor: "#F5F2ED",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-weave min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

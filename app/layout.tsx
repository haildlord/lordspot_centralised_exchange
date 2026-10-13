import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { PaletteProvider } from "@/components/search/PaletteProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif — used sparingly for the landing hero.
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "LordsPot Exchange — Rule the order book",
    template: "%s | LordsPot",
  },
  description:
    "LordsPot is an order-book exchange. Search any market, open the book and trade.",
};

export const viewport: Viewport = {
  themeColor: "#07070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        {/* TODO(api): pass `markets` to PaletteProvider once you have the list. */}
        <PaletteProvider>{children}</PaletteProvider>
      </body>
    </html>
  );
}

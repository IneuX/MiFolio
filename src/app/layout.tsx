import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopActions from "@/components/TopActions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mi Not me",
  description: "A minimal, dark-themed personal portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white selection:bg-white/20`}>
        <TopActions />
        {children}
      </body>
    </html>
  );
}

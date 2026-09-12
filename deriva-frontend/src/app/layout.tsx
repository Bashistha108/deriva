import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ClientLogger } from "./ClientLogger";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deriva - Options Trading Platform",
  description: "Advanced options chain and strategy builder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#111] text-gray-900 dark:text-[#b3b3b3] transition-colors duration-200">
        <ThemeProvider>
          <ClientLogger />
          <nav className="bg-gray-100 dark:bg-[#161616] border-b border-gray-300 dark:border-[#2a2a2a] p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-bold text-xl mr-4 text-gray-900 dark:text-white">
                  Deriva
                </Link>
                <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/portfolio" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Portfolio Risk
                </Link>
                <Link href="/trades" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Trades Ledger
                </Link>
                <Link href="/options" className="hover:text-gray-900 dark:hover:text-white transition-colors text-blue-600 dark:text-blue-400 font-medium">
                  Options Chain
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="flex-1 text-gray-900 dark:text-[#b3b3b3]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

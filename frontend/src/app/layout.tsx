import type { Metadata } from "next";
import "./globals.css";

import ClientNavbar from "../components/ClientNavbar";

export const metadata: Metadata = {
  title: "Deriva | Options Trading Platform",
  description: "Learn options trading and simulate the market in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientNavbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

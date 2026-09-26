import type { Metadata } from "next";
import "./globals.css";

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
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" className="heading-gradient" style={{ fontSize: '24px', textDecoration: 'none' }}>Deriva</a>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/dashboard" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
              <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Login</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}

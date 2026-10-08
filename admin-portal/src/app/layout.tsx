import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Home-Warrior — Admin Control Center',
  description: 'Independent management dashboard for Home-Warrior handmade doormats.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-craft-50 text-craft-900">{children}</body>
    </html>
  );
}

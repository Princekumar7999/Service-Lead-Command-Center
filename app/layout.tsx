import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gushwork FollowUp | Commercial Refrigeration Service Command Center',
  description: 'Never lose a commercial refrigeration job because you forgot to follow up. Built for Denise.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Gushwork FollowUp • Built for Denise (PolarFlow Commercial Refrigeration)</p>
              <p className="text-slate-400">
                Forward Deployed Engineer Prototype • Deterministic Business Logic + Human-in-the-Loop AI
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

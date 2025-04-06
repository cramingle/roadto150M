import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoadTo150M Booking',
  description: 'Schedule meetings efficiently through Telegram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen max-w-md mx-auto">
          <main className="flex-1 p-4">
            {children}
          </main>
          <footer className="py-3 px-4 text-center text-sm text-gray-500">
            <p>© 2025 RoadTo150M · All rights reserved</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

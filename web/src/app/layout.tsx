import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "react-day-picker/style.css";
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kerelski Barber & Beauty | Записване на час',
  description: 'Запишете час при Kerelski Barber & Beauty – професионални услуги за мъже и жени. Стилни прически, грижа за брадата и красота на едно място. Резервирайте сега!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <head>
        <link rel="icon" type="image/png" href="/book/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/book/favicon.svg" />
        <link rel="shortcut icon" href="/book/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/book/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Kerelski Barber & Beauty" />
        <link rel="manifest" href="/book/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen max-w-7xl mx-auto">
          {children}
          <Toaster />
        </main>
        <Footer />
      </body>
    </html>
  );
}

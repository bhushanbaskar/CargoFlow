import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { CargoFlowProvider } from '@/components/context/cargoflow-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CargoFlow - MSRTC Intelligent Cargo Network Platform',
  description: 'Transforming unused MSRTC public transport capacity into an intelligent, schedule-driven cargo network.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <CargoFlowProvider>{children}</CargoFlowProvider>
      </body>
    </html>
  );
}


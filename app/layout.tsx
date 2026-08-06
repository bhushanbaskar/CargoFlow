import type {Metadata} from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'CargoFlow - MSRTC Intelligent Cargo Network Platform',
  description: 'Transforming unused MSRTC public transport capacity into an intelligent, schedule-driven cargo network.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

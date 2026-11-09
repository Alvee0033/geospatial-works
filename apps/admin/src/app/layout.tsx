import type { Metadata } from 'next';
import './globals.css';
import './corporate.css';
import './interior.css';

export const metadata: Metadata = {
  title: 'Geospatial Works — Project Management Hub',
  description: 'Enterprise Geodesy & Infrastructure Project CMS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F8FAFC] text-slate-800" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

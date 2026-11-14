import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mars Pathfinder AI – Martian 3D Terrain Explorer',
  description: 'Interactive 3D Mars globe & Jezero Crater terrain exploration platform for NASA Space Apps Challenge 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}

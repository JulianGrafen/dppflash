// src/app/layout.tsx
// Root-Layout — wird von allen Routen geerbt.
import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'Gefahrstoff-QR',
  description: 'Digitales Gefahrstoffverzeichnis für deutsche KMU (GefStoffV-konform)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

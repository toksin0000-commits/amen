import './globals.css';
import type { Metadata } from 'next';
import RootLayoutClient from './RootLayoutClient';

export const metadata: Metadata = {
  title: 'Amen',
  description: 'Bible, modlitby, kostely a zpověď',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-152x152.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ Žádné html/body - jen children
    <RootLayoutClient>
      {children}
    </RootLayoutClient>
  );
}
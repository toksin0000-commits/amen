import '../globals.css';
import RootLayoutClient from '../RootLayoutClient';
import PWARegister from '../PWARegister';  // ← PŘIDÁNO

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" dir="ltr">
      <head>
        {/* ✅ Přidáme odkaz na manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* ✅ Doporučené meta pro mobilní zobrazení */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#d9b26c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Amen" />
        {/* Ikony pro iOS (pokud existují) */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen flex flex-col text-[#222]">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <PWARegister />  {/* ← PŘIDÁNO */}
      </body>
    </html>
  );
}
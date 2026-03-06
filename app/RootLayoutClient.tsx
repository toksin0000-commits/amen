'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function LangSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLang = segments[0] || 'cs';
  const subpath = segments.slice(1).join('/');

  const langs = [
    { code: 'cs', label: 'CS' },
    { code: 'en', label: 'EN' },
    { code: 'ur', label: 'UR' }
  ];

  return (
    <div 
      dir="ltr" 
      className="flex gap-2 bg-gray-100 px-3 py-1 rounded-full border shadow-sm shadow-black/50 min-w-[140px] justify-center"
    >
      {langs.map(({ code, label }) => (
        <Link
          key={code}
          href={`/${code}${subpath ? '/' + subpath : ''}`}
          className={`px-3 py-1 rounded-full text-sm text-[#222] transition-all min-w-[44px] text-center ${
            currentLang === code 
              ? 'bg-amber-100 border-amber-300 font-medium' 
              : 'hover:bg-gray-100 hover:shadow-md'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const isPriest = pathname?.startsWith('/priest') ?? false;
  const currentLang = pathname?.split('/')[1] || 'cs';

  return (
    <>
      {!isPriest && (
        <div className="fixed top-4 right-4 z-50">
          <LangSwitcher />
        </div>
      )}

      {/* ✅ Žádné další obaly - RTL řešíme až v jednotlivých stránkách */}
      {children}
    </>
  );
}
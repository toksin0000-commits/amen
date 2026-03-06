'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Počkáme na načtení stránky
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('✅ Service Worker registered:', registration.scope);
          },
          (error) => {
            console.log('❌ Service Worker registration failed:', error);
          }
        );
      });
    }
  }, []);

  return null;
}

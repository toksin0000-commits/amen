// app/[lang]/churches/page.tsx
"use client";

import Link from "next/link";
import { use } from "react";
import { useChurches } from './useChurches';
import { Lang } from './church.types';

// Překlady
const translations = {
  cs: {
    title: "Kostely v okolí",
    findNearby: "Najít kostely v okolí",
    finding: "Hledám kostely...",
    distance: "Vzdálenost",
    home: "Domů",
    km: "km",
    noChurches: "Žádné kostely v okolí",
    error: "Nepodařilo se načíst kostely",
    denomination: "Církev",
    address: "Adresa",
    nearbyChurch: "Kostel v okolí",
    searching: "Hledám kostely ve vašem okolí...",
    notFound: "V okolí nebyly nalezeny žádné kostely.",
    cooldownMessage: "Počkejte prosím před dalším hledáním"
  },
  en: {
    title: "Churches Nearby",
    findNearby: "Find Churches Near Me",
    finding: "Finding churches...",
    distance: "Distance",
    home: "Home",
    km: "km",
    noChurches: "No churches nearby",
    error: "Failed to load churches",
    denomination: "Denomination",
    address: "Address",
    nearbyChurch: "Nearby church",
    searching: "Searching for churches near you...",
    notFound: "No churches found nearby.",
    cooldownMessage: "Please wait before searching again"
  },
  ur: {
    title: "آس پاس کے گرجا گھر",
    findNearby: "قریبی گرجا گھر تلاش کریں",
    finding: "گرجا گھر تلاش ہو رہے ہیں...",
    distance: "فاصلہ",
    home: "مرکزی صفحہ",
    km: "کلومیٹر",
    noChurches: "آس پاس کوئی گرجا گھر نہیں",
    error: "گرجا گھر لوڈ کرنے میں ناکامی",
    denomination: "فرقہ",
    address: "پتہ",
    nearbyChurch: "آس پاس کا گرجا گھر",
    searching: "آپ کے آس پاس گرجا گھر تلاش کر رہا ہے...",
    notFound: "آس پاس کوئی گرجا گھر نہیں ملا۔",
    cooldownMessage: "براہ کرم اگلی تلاش سے پہلے انتظار کریں"
  }
};

export default function ChurchesPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  const t = translations[lang];
  
  const {
    userLocation,
    nearbyChurches,
    loading,
    error,
    cooldown,
    notFound,
    handleFindNearby,
    clearCacheForLocation // ✅ PŘIDÁNO
  } = useChurches(lang, t);

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 text-[#222]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 left-4" style={{ left: '1rem', right: 'auto' }}>
        <Link href={`/${lang}`} className="text-sm text-[#222] hover:underline bg-white/70 px-3 py-1 rounded-full shadow-sm shadow-black/50 inline-flex items-center justify-center h-9.5">
          {lang === 'ur' ? '→' : '←'} {t.home}
        </Link>
      </div>

      <div className="mt-25">
        <h1 className="text-lg font-medium text-center text-[#222]">{t.title}</h1>
        
        <button
          onClick={handleFindNearby}
          disabled={loading || cooldown}
          className="mt-4 w-full py-3 px-4 bg-[#726c6c] text-[#f7f5f2] rounded-xl border border-white shadow-sm shadow-black/50 font-medium hover:bg-opacity-80 transition disabled:opacity-50"
        >
          {loading ? t.finding : (cooldown ? '⏳' : t.findNearby)}
        </button>

        {/* ✅ Tlačítko pro obnovení - zobrazí se jen když je poloha známá */}
        {userLocation && (
          <button
            onClick={() => {
              clearCacheForLocation(userLocation.lat, userLocation.lng);
              handleFindNearby();
            }}
          className="mt-2 w-full py-2 px-3 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition border border-white shadow-sm shadow-black/50" 
          >
            {lang === 'cs' ? 'Obnovit polohu' : 
             lang === 'ur' ? 'مقام کی تجدید کریں' : 
             'Refresh location'}
          </button>
        )}

        {/* Stav: Probíhá hledání */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="animate-pulse text-[#d9b26c] text-2xl">⏳</div>
            <p className="text-sm text-gray-600 mt-2">{t.searching}</p>
          </div>
        )}

        {/* Stav: Před prvním hledáním */}
        {!userLocation && !loading && !error && !notFound && nearbyChurches.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16">
            <img src="/images/church-silhouette.png" alt="Church silhouette" loading="lazy" className="w-48 h-48 object-contain brightness-50 contrast-125" />
            <p className="text-sm text-gray-600 mt-4 font-medium">
              {lang === 'cs' ? ' Najděte kostely ve svém okolí' :
               lang === 'ur' ? ' اپنے آس پاس گرجا گھر تلاش کریں' :
               ' Find churches near you'}
            </p>
          </div>
        )}

        {/* Stav: Chyba */}
        {error && !loading && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Stav: Nic nenalezeno */}
        {notFound && !loading && !error && (
          <p className="mt-2 text-sm text-amber-600 text-center">{t.notFound}</p>
        )}

        {/* Stav: Nalezené kostely */}
        {!loading && !error && !notFound && nearbyChurches.length > 0 && (
          <div className="flex flex-col gap-4 mt-6">
            {nearbyChurches.map((church, index) => (
              <div key={`${church.name}-${index}`} className="rounded-xl px-4 py-3 text-sm bg-[#f7f5f2] text-[#222] shadow-inner shadow-amber-900/10">
                <h2 className="font-medium text-[#222]">{church.name}</h2>
                {church.denomination && (
                  <p className="text-xs text-gray-600 mt-0.5">{t.denomination}: {church.denomination}</p>
                )}
                <p className="text-sm text-[#222] mt-1">{church.address}</p>
                <p className="text-xs text-gray-600 mt-2">{t.distance}: {church.distance.toFixed(1)} {t.km}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
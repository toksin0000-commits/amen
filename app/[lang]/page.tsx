'use client';

import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/getDictionary';
import { prayers } from '@/lib/daily-prayers';
import { dailyVerses } from '@/lib/daily-verses';
import Link from 'next/link';

export default function HomePage(props: { params: Promise<{ lang: 'cs' | 'en' | 'ur' }> }) {
  const [dict, setDict] = useState<any>(null);
  const [lang, setLang] = useState<'cs' | 'en' | 'ur'>('cs');
  const [dailyVerse, setDailyVerse] = useState<{ text: string; reference: string } | null>(null);
  const [dailyPrayer, setDailyPrayer] = useState<string>('');

  useEffect(() => {
    async function load() {
      const { lang } = await props.params;
      setLang(lang);
      setDict(getDictionary(lang));
      
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const versesInLang = dailyVerses[lang] || dailyVerses.cs;
      const verseIndex = dayOfYear % versesInLang.length;
      setDailyVerse(versesInLang[verseIndex]);
      
      const prayersInLang = prayers[lang] || prayers.cs;
      const prayerIndex = (dayOfYear + 7) % prayersInLang.length;
      setDailyPrayer(prayersInLang[prayerIndex]);
    }
    load();
  }, [props.params]);

  if (!dict) return null;

  return (
    <div className="flex flex-col items-center justify-start px-6 pt-24 min-h-screen">
      {/* Hlavní kontejner s pevnou výškou pro horní část */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* AMEN - fixní kontejner */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-2xl text-[#000000]">✝</span>
            <h1 className="text-3xl font-light text-[#000000]">Amen</h1>
            <span className="text-2xl text-[#000000]">✝</span>
          </div>
          {/* Subtitle s fixní výškou 40px */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-xs text-gray-400 tracking-widest leading-5">
              {dict.subtitle}
            </p>
          </div>
        </div>
       
        {/* Denní verš - fixní výška */}
        <div className="w-full min-h-[140px] flex flex-col items-center justify-center mb-12">
          <h1 className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3">
            {dict.verse_of_day}
          </h1>
          {dailyVerse && (
            <>
              <p className="text-xl text-red-800 text-center mb-1">{dailyVerse.text}</p>
              <p className="text-sm text-gray-500 text-center">{dailyVerse.reference}</p>
            </>
          )}
        </div>

        {/* Denní modlitba - fixní výška */}
        <div className="w-full min-h-[100px] flex flex-col items-center justify-center">
          <h2 className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3">
            {dict.prayer_of_day}
          </h2>
          <p className="text-base max-w-md text-black text-center">{dailyPrayer}</p>
        </div>
      </div>

      {/* Navigace dole */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-300 bg-gray-100/90 backdrop-blur-sm flex items-center justify-around text-2xl">
        <Link href={`/${lang}/bible`}>📖</Link>
        <Link href={`/${lang}/wishes`}>🕯</Link>
        <Link href={`/${lang}/churches`}>⛪</Link>
      </nav>
    </div>
  );
}
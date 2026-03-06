'use client';

import Link from 'next/link';
import { books, useBible } from './useBible';
import { useEffect, useRef, useState } from 'react';

interface BibleViewProps {
  lang: 'cs' | 'en' | 'ur';
}

export default function BibleView({ lang }: BibleViewProps) {
  const {
    book, chapter, verses, loading, error,
    t, currentBook, setBook, setChapter, getBookName
  } = useBible(lang);
  
  const versesRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number>(400); // Výchozí výška

  // Po načtení veršů změříme výšku a nastavíme min-height pro plynulost
  useEffect(() => {
    if (!loading && versesRef.current) {
      const height = versesRef.current.scrollHeight;
      setMinHeight(Math.max(400, height)); // Minimálně 400px, jinak výška obsahu
    }
  }, [verses, loading]);

  return (
    <div className="p-6 flex flex-col gap-6" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 left-4" style={{ left: '1rem', right: 'auto' }}>
        <Link href={`/${lang}`} className="text-sm text-[#222] hover:underline bg-white/70 px-3 py-1 rounded-full shadow-sm shadow-black/50 inline-flex items-center justify-center h-9.5">
          {lang === 'ur' ? '→' : '←'} {t.home}
        </Link>
      </div>

      <div className="mt-20">
        
        {/* ✅ NÁZEV BIBLE */}
        <h1 className="text-3xl font-light text-center text-[#000000] mb-6 tracking-widest">
          {t.title}
        </h1>

        <div>
          <label className="block text-sm text-[#222] mb-1">{t.book}</label>
          <select value={book} onChange={(e) => { setBook(e.target.value); setChapter(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#222] shadow-inner shadow-black/10">
            {books.map(b => (
              <option key={b.id} value={b.id}>
                {lang === 'cs' ? b.name_cs : lang === 'ur' ? b.name_ur : b.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-[#222] mb-1">{t.chapter}</label>
          <select value={chapter} onChange={(e) => setChapter(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#222] shadow-inner shadow-black/10">
            {Array.from({ length: currentBook?.chapters || 1 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <h1 className="text-xl font-bold text-[#222] mt-6">{getBookName(book)} {chapter}</h1>

        {loading && (
          <div 
            className="mt-4 flex items-center justify-center p-8"
            style={{ minHeight: `${minHeight}px` }}
          >
            <p className="text-gray-500">{t.loading}</p>
          </div>
        )}
        
        {error && (
          <div 
            className="mt-4 flex items-center justify-center p-8"
            style={{ minHeight: `${minHeight}px` }}
          >
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div 
            ref={versesRef}
            className="space-y-3 leading-relaxed mt-4 transition-none"
            style={{ minHeight: `${minHeight}px` }}
          >
            {verses.map(v => (
              <p key={v.verse} className="text-[#222]">
                <span className="font-semibold">{v.verse}.</span> {v.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

// ========== TYPES ==========
type Verse = { verse: number; text: string };
type Chapter = { verses: Verse[] };
type Book = { chapters: Chapter[] };
type BibleData = { [bookId: string]: Book };
export type Lang = 'cs' | 'en' | 'ur';

// ========== CACHE ==========
interface BibleCacheData { data: BibleData; timestamp: number }
const bibleCache = new Map<string, BibleCacheData>();
const BIBLE_CACHE_DURATION = 86400000; // 24 hodin

// ========== STATICKÁ DATA ==========
export const books = [
  { id: "genesis", name_cs: "Genesis", name_en: "Genesis", name_ur: "پیدائش", chapters: 50 },
  { id: "exodus", name_cs: "Exodus", name_en: "Exodus", name_ur: "خروج", chapters: 40 },
  { id: "leviticus", name_cs: "Levitikus", name_en: "Leviticus", name_ur: "احبار", chapters: 27 },
  { id: "numbers", name_cs: "Numeri", name_en: "Numbers", name_ur: "گنتی", chapters: 36 },
  { id: "deuteronomy", name_cs: "Deuteronomium", name_en: "Deuteronomy", name_ur: "استثنا", chapters: 34 },
  { id: "joshua", name_cs: "Jozue", name_en: "Joshua", name_ur: "یشوع", chapters: 24 },
  { id: "judges", name_cs: "Soudců", name_en: "Judges", name_ur: "قضاۃ", chapters: 21 },
  { id: "ruth", name_cs: "Rút", name_en: "Ruth", name_ur: "روت", chapters: 4 },
  { id: "1samuel", name_cs: "1 Samuelova", name_en: "1 Samuel", name_ur: "۱ سموئیل", chapters: 31 },
  { id: "2samuel", name_cs: "2 Samuelova", name_en: "2 Samuel", name_ur: "۲ سموئیل", chapters: 24 },
  { id: "1kings", name_cs: "1 Královská", name_en: "1 Kings", name_ur: "۱ سلاطین", chapters: 22 },
  { id: "2kings", name_cs: "2 Královská", name_en: "2 Kings", name_ur: "۲ سلاطین", chapters: 25 },
  { id: "1chronicles", name_cs: "1 Paralipomenon", name_en: "1 Chronicles", name_ur: "۱ تواریخ", chapters: 29 },
  { id: "2chronicles", name_cs: "2 Paralipomenon", name_en: "2 Chronicles", name_ur: "۲ تواریخ", chapters: 36 },
  { id: "ezra", name_cs: "Ezdráš", name_en: "Ezra", name_ur: "عزرا", chapters: 10 },
  { id: "nehemiah", name_cs: "Nehemjáš", name_en: "Nehemiah", name_ur: "نحمیاہ", chapters: 13 },
  { id: "esther", name_cs: "Ester", name_en: "Esther", name_ur: "آستر", chapters: 10 },
  { id: "job", name_cs: "Jób", name_en: "Job", name_ur: "ایوب", chapters: 42 },
  { id: "psalms", name_cs: "Žalmy", name_en: "Psalms", name_ur: "زبور", chapters: 150 },
  { id: "proverbs", name_cs: "Přísloví", name_en: "Proverbs", name_ur: "امثال", chapters: 31 },
  { id: "ecclesiastes", name_cs: "Kazatel", name_en: "Ecclesiastes", name_ur: "واعظ", chapters: 12 },
  { id: "songofsolomon", name_cs: "Píseň písní", name_en: "Song of Solomon", name_ur: "غزل الغزلات", chapters: 8 },
  { id: "isaiah", name_cs: "Izajáš", name_en: "Isaiah", name_ur: "یسعیاہ", chapters: 66 },
  { id: "jeremiah", name_cs: "Jeremjáš", name_en: "Jeremiah", name_ur: "یرمیاہ", chapters: 52 },
  { id: "lamentations", name_cs: "Pláč", name_en: "Lamentations", name_ur: "نوحہ", chapters: 5 },
  { id: "ezekiel", name_cs: "Ezechiel", name_en: "Ezekiel", name_ur: "حزقی ایل", chapters: 48 },
  { id: "daniel", name_cs: "Daniel", name_en: "Daniel", name_ur: "دانی ایل", chapters: 12 },
  { id: "hosea", name_cs: "Ozeáš", name_en: "Hosea", name_ur: "ہوسیع", chapters: 14 },
  { id: "joel", name_cs: "Jóel", name_en: "Joel", name_ur: "یوایل", chapters: 3 },
  { id: "amos", name_cs: "Ámos", name_en: "Amos", name_ur: "عاموس", chapters: 9 },
  { id: "obadiah", name_cs: "Abdjáš", name_en: "Obadiah", name_ur: "عبدیاہ", chapters: 1 },
  { id: "jonah", name_cs: "Jonáš", name_en: "Jonah", name_ur: "یوناہ", chapters: 4 },
  { id: "micah", name_cs: "Micheáš", name_en: "Micah", name_ur: "میکاہ", chapters: 7 },
  { id: "nahum", name_cs: "Nahum", name_en: "Nahum", name_ur: "ناحوم", chapters: 3 },
  { id: "habakkuk", name_cs: "Abakuk", name_en: "Habakkuk", name_ur: "حبقوق", chapters: 3 },
  { id: "zephaniah", name_cs: "Sofonjáš", name_en: "Zephaniah", name_ur: "صفنیاہ", chapters: 3 },
  { id: "haggai", name_cs: "Ageus", name_en: "Haggai", name_ur: "حجی", chapters: 2 },
  { id: "zechariah", name_cs: "Zacharjáš", name_en: "Zechariah", name_ur: "زکریاہ", chapters: 14 },
  { id: "malachi", name_cs: "Malachiáš", name_en: "Malachi", name_ur: "ملاکی", chapters: 4 },
  { id: "matthew", name_cs: "Matouš", name_en: "Matthew", name_ur: "متی", chapters: 28 },
  { id: "mark", name_cs: "Marek", name_en: "Mark", name_ur: "مرقس", chapters: 16 },
  { id: "luke", name_cs: "Lukáš", name_en: "Luke", name_ur: "لوقا", chapters: 24 },
  { id: "john", name_cs: "Jan", name_en: "John", name_ur: "یوحنا", chapters: 21 },
  { id: "acts", name_cs: "Skutky", name_en: "Acts", name_ur: "اعمال", chapters: 28 },
  { id: "romans", name_cs: "Římanům", name_en: "Romans", name_ur: "رومیوں", chapters: 16 },
  { id: "1corinthians", name_cs: "1 Korintským", name_en: "1 Corinthians", name_ur: "۱ کرنتھیوں", chapters: 16 },
  { id: "2corinthians", name_cs: "2 Korintským", name_en: "2 Corinthians", name_ur: "۲ کرنتھیوں", chapters: 13 },
  { id: "galatians", name_cs: "Galatským", name_en: "Galatians", name_ur: "گلتیوں", chapters: 6 },
  { id: "ephesians", name_cs: "Efezským", name_en: "Ephesians", name_ur: "افسیوں", chapters: 6 },
  { id: "philippians", name_cs: "Filipským", name_en: "Philippians", name_ur: "فلپیوں", chapters: 4 },
  { id: "colossians", name_cs: "Koloským", name_en: "Colossians", name_ur: "کلسیوں", chapters: 4 },
  { id: "1thessalonians", name_cs: "1 Tesalonickým", name_en: "1 Thessalonians", name_ur: "۱ تھسلنیکیوں", chapters: 5 },
  { id: "2thessalonians", name_cs: "2 Tesalonickým", name_en: "2 Thessalonians", name_ur: "۲ تھسلنیکیوں", chapters: 3 },
  { id: "1timothy", name_cs: "1 Timoteovi", name_en: "1 Timothy", name_ur: "۱ تیمتھیس", chapters: 6 },
  { id: "2timothy", name_cs: "2 Timoteovi", name_en: "2 Timothy", name_ur: "۲ تیمتھیس", chapters: 4 },
  { id: "titus", name_cs: "Titovi", name_en: "Titus", name_ur: "ططس", chapters: 3 },
  { id: "philemon", name_cs: "Filemonovi", name_en: "Philemon", name_ur: "فلیمون", chapters: 1 },
  { id: "hebrews", name_cs: "Židům", name_en: "Hebrews", name_ur: "عبرانیوں", chapters: 13 },
  { id: "james", name_cs: "Jakubův", name_en: "James", name_ur: "یعقوب", chapters: 5 },
  { id: "1peter", name_cs: "1 Petrův", name_en: "1 Peter", name_ur: "۱ پطرس", chapters: 5 },
  { id: "2peter", name_cs: "2 Petrův", name_en: "2 Peter", name_ur: "۲ پطرس", chapters: 3 },
  { id: "1john", name_cs: "1 Janův", name_en: "1 John", name_ur: "۱ یوحنا", chapters: 5 },
  { id: "2john", name_cs: "2 Janův", name_en: "2 John", name_ur: "۲ یوحنا", chapters: 1 },
  { id: "3john", name_cs: "3 Janův", name_en: "3 John", name_ur: "۳ یوحنا", chapters: 1 },
  { id: "jude", name_cs: "Judův", name_en: "Jude", name_ur: "یہوداہ", chapters: 1 },
  { id: "revelation", name_cs: "Zjevení", name_en: "Revelation", name_ur: "مکاشفہ", chapters: 22 },
];

// ========== PŘEKLADY ==========
export const translations = {
  cs: { title: "Bible", book: "Kniha", chapter: "Kapitola", loading: "Načítám text...", error: "Nepodařilo se načíst text Bible.", home: "Domů", search: "Hledat" },
  en: { title: "Bible", book: "Book", chapter: "Chapter", loading: "Loading...", error: "Failed to load Bible text.", home: "Home", search: "Search" },
  ur: { title: "انجیل", book: "کتاب", chapter: "باب", loading: "لوڈ ہو رہا ہے...", error: "انجیل کا متن لوڈ نہیں ہو سکا۔", home: "مرکزی صفحہ", search: "تلاش کریں" },
};

// ========== HOOK ==========
export const useBible = (lang: Lang) => {
  const [book, setBook] = useState("john");
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  const getBookName = (bookId: string) => {
    const b = books.find(b => b.id === bookId);
    if (!b) return bookId;
    if (lang === 'cs') return b.name_cs;
    if (lang === 'ur') return b.name_ur;
    return b.name_en;
  };

  useEffect(() => {
    async function loadBible() {
      setLoading(true);
      setError(null);
      const cacheKey = `bible_${lang}`;
      const cached = bibleCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < BIBLE_CACHE_DURATION) {
        const bookData = cached.data[book];
        if (bookData?.chapters?.[chapter - 1]) {
          setVerses(bookData.chapters[chapter - 1].verses || []);
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/data/bible/${lang}/bible.json`);
        if (!res.ok) throw new Error('Načtení selhalo');
        const bibleData: BibleData = await res.json();
        bibleCache.set(cacheKey, { data: bibleData, timestamp: Date.now() });

        const bookData = bibleData[book];
        if (bookData?.chapters?.[chapter - 1]) {
          setVerses(bookData.chapters[chapter - 1].verses || []);
        }
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    }
    loadBible();
  }, [lang, book, chapter, t.error]);

  const currentBook = books.find(b => b.id === book);

  return { book, chapter, verses, loading, error, t, currentBook, setBook, setChapter, getBookName };
};
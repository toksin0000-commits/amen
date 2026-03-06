'use client';

import Link from 'next/link';

interface WishesDisplayProps {
  wishes: any[];
  loading: boolean;
  error: string | null;
  canPost: boolean;
  text: string;
  submitted: boolean;
  reportingId: string | null;
  honeypot: string;
  setText: (text: string) => void;
  setHoneypot: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReport: (id: string) => Promise<void>;
  formatDate: (date: string) => string;
  dict: any;
  lang: string;
}

export default function WishesDisplay({
  wishes,
  loading,
  error,
  canPost,
  text,
  submitted,
  reportingId,
  honeypot,
  setText,
  setHoneypot,
  handleSubmit,
  handleReport,
  formatDate,
  dict,
  lang
}: WishesDisplayProps) {
  return (
    <div className="flex-1 flex flex-col px-6 pb-4 gap-6 text-[#222]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 left-4" style={{ left: '1rem', right: 'auto' }}>
        <Link href={`/${lang}`} className="text-sm text-black hover:underline bg-white/70 px-3 py-1 rounded-full shadow-sm shadow-black/50 inline-flex items-center justify-center h-9.5">
          {lang === 'ur' ? '→' : '←'} {dict.home}
        </Link>
      </div>

      <div className="mt-30">
        <h1 className="text-lg font-medium text-center text-[#222]">{dict.wishes_title}</h1>
        <p className="text-sm text-[#222] text-center mt-2">{dict.wishes_subtitle}</p>

        {!canPost && (
          <p className="text-sm text-center text-amber-600 mt-2">
            {lang === 'cs' ? 'Dnes už jsi přidal své přání. Zkus to zítra!' :
             lang === 'ur' ? 'آپ آج پہلے ہی اپنی خواہش شامل کر چکے ہیں۔ کل کوشش کریں!' :
             'You have already added your wish today. Try again tomorrow!'}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder={dict.wishes_placeholder}
            disabled={!canPost}
            className="w-full border-b border-gray-300 bg-transparent outline-none resize-none py-2 text-[#222] disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />

          <button
            type="submit"
            disabled={loading || !text.trim() || !canPost}
            className="self-center px-6 py-2 rounded-full bg-[#d9b26c] text-black disabled:opacity-50 shadow-sm shadow-black/50 hover:shadow-xl hover:shadow-black/60 transition-shadow"
          >
            {loading ? dict.sending : dict.send}
          </button>
        </form>

        {submitted && (
          <p className="text-xs text-center text-green-700 mt-3">{dict.wishes_submitted}</p>
        )}

        {error && (
          <p className="text-xs text-center text-red-600 mt-3">{error}</p>
        )}

        <section className="flex-1 overflow-y-auto pb-4 mt-8">
          <h2 className="text-sm tracking-[0.2em] uppercase text-center mb-3 text-[#222]">
            {dict.wishes_list_title} ({wishes.length})
          </h2>

          <div className="flex flex-col gap-3">
            {wishes.length === 0 && !error && (
              <p className="text-center text-gray-500">
                {lang === 'cs' ? 'Zatím žádná přání. Buď první!' : 
                 lang === 'ur' ? 'ابھی تک کوئی خواہش نہیں۔ پہلے بنیں!' : 
                 'No wishes yet. Be the first!'}
              </p>
            )}
            
            {wishes.map((w) => (
              <div key={w.id} className="rounded-xl px-4 py-3 text-sm text-[#222] bg-[#f7f5f2] wrap-break-word whitespace-pre-wrap shadow-inner shadow-amber-900/20">
                <p className="wrap-break-word">{w.text}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-800">{formatDate(w.created_at)}</p>
                  <button
                    onClick={() => handleReport(w.id)}
                    disabled={reportingId === w.id}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {reportingId === w.id ? '...' : '🚩'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Wish = {
  id: string;
  text: string;
  created_at: string;
  reports?: number;
  is_hidden?: boolean;
};

// 📚 VLASTNÍ KNIHOVNA PRO FILTRACI SPROSTÝCH SLOV (VŠECHNY JAZYKY DOHROMADY)
const badWords = [
  // Anglická
  'fuck', 'shit', 'damn', 'cunt', 'asshole', 'bastard', 'bitch', 'dick', 'piss',
  'fucking', 'motherfucker', 'pussy', 'whore', 'slut',
  
  // Česká
  'kurva', 'pica', 'píča', 'kokot', 'čurák', 'debil', 'kretén', 'zmrd', 'hajzl',
  'mrdat', 'sracka', 'sračka', 'posera', 'zjebany', 'zjebaný', 'zjebat', 'do pice',
  'do piče', 'do prdele', 'do hajzlu', 'do hajzla', 'kundo', 'kunda',
  
  // Můžeš přidat i urdská, pokud najdeš seznam
];

const containsBadWords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
};

export const useWishes = (dict: any, lang: string) => {
  const [text, setText] = useState('');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [canPost, setCanPost] = useState(true);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  // Získání IP adresy
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(err => console.error('Chyba při získávání IP:', err));
  }, []);

  // Kontrola denního limitu
  useEffect(() => {
    if (!ipAddress) return;

    async function checkDailyLimit() {
      try {
        const response = await fetch('/api/check-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: ipAddress, lang })
        });
        const data = await response.json();
        setCanPost(data.canPost);
      } catch (err) {
        console.error('Chyba při kontrole limitu:', err);
      }
    }
    checkDailyLimit();
  }, [ipAddress, lang]);

  // Načtení přání
  const loadWishes = async () => {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setWishes(data);

    } catch (err) {
      console.error('Chyba při načítání:', err);
      setFetchError('Nepodařilo se načíst přání');
    }
  };

  // Automatický refresh
  useEffect(() => {
    loadWishes();
    const interval = setInterval(loadWishes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Nahlášení přání
  const handleReport = async (wishId: string) => {
    if (!confirm(lang === 'cs' ? 'Opravdu chceš nahlásit toto přání?' : 
                 lang === 'ur' ? 'کیا آپ واقعی اس خواہش کی رپورٹ کرنا چاہتے ہیں؟' : 
                 'Do you really want to report this wish?')) return;

    setReportingId(wishId);

    try {
      const response = await fetch('/api/report-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishId })
      });

      if (!response.ok) throw new Error('Chyba při nahlašování');

      alert(lang === 'cs' ? 'Přání bylo nahlášeno. Děkujeme!' :
            lang === 'ur' ? 'خواہش کی اطلاع دے دی گئی ہے۔ شکریہ!' :
            'The wish has been reported. Thank you!');
      
      loadWishes();
    } catch (err) {
      console.error('Chyba při nahlašování:', err);
      alert(lang === 'cs' ? 'Nepodařilo se nahlásit. Zkus to znovu.' :
            lang === 'ur' ? 'رپورٹ کرنے میں ناکامی۔ دوبارہ کوشش کریں۔' :
            'Failed to report. Please try again.');
    } finally {
      setReportingId(null);
    }
  };

  // Odeslání nového přání
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (honeypot) {
      console.log('🤖 Bot detected');
      return;
    }

    if (!text.trim() || !canPost) return;
    if (!ipAddress) {
      alert('Nepodařilo se ověřit IP adresu. Zkus to znovu.');
      return;
    }

    if (containsBadWords(text)) {
      alert(lang === 'cs' ? '❌ Přání obsahuje nevhodná slova' : 
            lang === 'ur' ? '❌ خواہش میں نامناسب الفاظ ہیں' : 
            '❌ Wish contains inappropriate words');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('wishes')
        .insert({ 
          text: text.trim(),
          language: lang,
          ip_address: ipAddress
        });

      if (error) throw error;

      setText('');
      setSubmitted(true);
      setCanPost(false);
      await loadWishes();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Chyba při odesílání:', err);
      alert('Nepodařilo se odeslat přání. Zkus to znovu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'cs' ? 'cs-CZ' : lang === 'ur' ? 'ur-PK' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    // Data
    wishes,
    loading,
    error: fetchError,
    canPost,
    text,
    submitted,
    reportingId,
    honeypot,
    
    // Funkce
    setText,
    setHoneypot,
    handleSubmit,
    handleReport,
    formatDate
  };
};
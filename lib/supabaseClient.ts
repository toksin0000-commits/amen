import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
    storage: typeof window !== 'undefined' ? {
      getItem: (key) => {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(key + '='));
        if (cookie) {
          console.log('📖 Čtu z cookie:', key);
          return decodeURIComponent(cookie.split('=')[1]);
        }
        const local = localStorage.getItem(key);
        console.log('📖 Čtu z localStorage:', key);
        return local;
      },
      setItem: (key, value) => {
        console.log('💾 Ukládám do localStorage a cookie:', key);
        localStorage.setItem(key, value);
        localStorage.setItem('lastSet', Date.now().toString()); // ✅ čas posledního uložení
        const encodedValue = encodeURIComponent(value);
        document.cookie = `${key}=${encodedValue}; path=/; max-age=604800; SameSite=Lax; Secure`;
        console.log('🍪 Cookie nastavena, délka:', encodedValue.length);
      },
      removeItem: (key) => {
        // ✅ Pokud mažeme token hned po nastavení, ignorujeme to (bug v Supabase)
        const lastSet = localStorage.getItem('lastSet');
        const now = Date.now();
        
        if (lastSet && now - parseInt(lastSet) < 5000) {
          console.log('⚠️ Ignoruji removeItem – příliš brzy po setItem');
          return;
        }
        
        console.log('🗑️ MAŽU cookie a localStorage:', key);
        localStorage.removeItem(key);
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
      }
    } : undefined
  }
});
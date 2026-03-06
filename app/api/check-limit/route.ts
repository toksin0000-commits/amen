import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { ip, lang } = await req.json();
    
    // Zjistit začátek dne (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Spočítat přání z této IP za dnešek
    const { count, error } = await supabase
      .from('wishes')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', today.toISOString());

    if (error) throw error;

    return NextResponse.json({ 
      canPost: count === 0, // Může psát, pokud dnes ještě nepsal
      count: count || 0 
    });
  } catch (err) {
    console.error('Chyba při kontrole limitu:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
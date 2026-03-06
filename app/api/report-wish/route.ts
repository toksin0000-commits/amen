import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  console.log('📡 API report-wish voláno');

  try {
    const body = await req.json();
    const { wishId } = body;

    if (!wishId) {
      return NextResponse.json({ error: 'Missing wishId' }, { status: 400 });
    }

    // 🌐 IP uživatele
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    console.log('  🌐 IP:', ip);

    // 0) Zkusíme vložit report (unikátní kombinace wish_id + ip_address)
    const { error: insertError } = await supabaseAdmin
      .from('wish_reports')
      .insert({ wish_id: wishId, ip_address: ip });

    if (insertError) {
      console.log('  ⚠️ Už reportoval:', insertError.message);
      return NextResponse.json({ success: false, alreadyReported: true });
    }

    // 1) Zjistíme aktuální počet nahlášení
    const { data, error } = await supabaseAdmin
      .from('wishes')
      .select('reports')
      .eq('id', wishId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    const newReports = (data.reports || 0) + 1;

    // 2) Aktualizujeme počet nahlášení
    await supabaseAdmin
      .from('wishes')
      .update({ reports: newReports })
      .eq('id', wishId);

    // 3) Pokud jsou 3 různí lidé → skryjeme přání
    if (newReports >= 3) {
      await supabaseAdmin
        .from('wishes')
        .update({ is_hidden: true })
        .eq('id', wishId);

      return NextResponse.json({ success: true, hidden: true });
    }

    return NextResponse.json({ success: true, reports: newReports });

  } catch (err) {
    console.error('❌ Chyba v API:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}

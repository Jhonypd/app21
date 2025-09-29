import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const session = await req.json();

  // Grava a sessão nos cookies do servidor
  await supabase.auth.setSession(session);

  return NextResponse.json({ ok: true });
}

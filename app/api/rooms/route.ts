import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

interface RoomsProps {
  password?: string | null;
  privateRoom: boolean;
}

async function generateUniqueCode(
  supabase: SupabaseClient,
) {
  let code: string;
  let exists = true;

  while (exists) {
    code = randomUUID().slice(0, 8);
    const { data } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    exists = !!data;
  }

  return code!;
}

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie');
  console.log(
    '🍪 Cookies recebidos:',
    cookieHeader?.includes('supabase-auth-token')
      ? 'Contém supabase-auth-token'
      : 'NÃO contém cookie de autenticação',
  );
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log('🔍 Debug Auth:');
    console.log('- authError:', authError);
    console.log('- user:', user);
    console.log('- user.id:', user?.id);
    if (authError || !user) {
      console.warn(
        '⚠️ Usuário NÃO autenticado ou sessão inválida',
      );
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 },
      );
    }
    console.log(
      '✅ Usuário autenticado com sucesso:',
      user.id,
    );
    const body: RoomsProps = await req.json();
    const { password, privateRoom } = body;

    if (privateRoom && !password) {
      return NextResponse.json(
        {
          error:
            'É necessário uma senha para salas privadas',
        },
        { status: 400 },
      );
    }

    const code = await generateUniqueCode(supabase);

    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        created_by: user.id,
        password: password ?? null,
        code,
        private: privateRoom,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro do Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(newRoom, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    return NextResponse.json(
      { error: 'Erro inesperado' },
      { status: 500 },
    );
  }
}

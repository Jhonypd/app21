import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'crypto';

interface RoomsProps {
  createdBy: string;
  password?: string | null;
  privateRoom: boolean;
}

async function generateUniqueCode(
  supabasePromise: ReturnType<typeof createClient>,
) {
  const supabase = await supabasePromise; // resolve a promise
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
  try {
    const token = req.headers
      .get('Authorization')
      ?.replace('Bearer ', '');
    if (!token)
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 },
      );

    const body: RoomsProps = await req.json();

    const supabase = await createClient();

    const { createdBy, password, privateRoom } = body;
    if (!createdBy)
      return NextResponse.json(
        { error: 'Id do usuário não informado' },
        { status: 400 },
      );
    if (privateRoom && !password)
      return NextResponse.json(
        {
          error:
            'É necessário uma senha para salas privadas',
        },
        { status: 400 },
      );

    const code = await generateUniqueCode(createClient());
    const withPassword = password ?? null;
    console.log(createdBy);
    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        created_by: createdBy,
        password: withPassword,
        code,
        private: privateRoom,
      })
      .select()
      .single();

    if (error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );

    return NextResponse.json(newRoom, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    return NextResponse.json(
      { error: 'Erro inesperado' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Remove o cookie de acesso
    cookieStore.delete('access_token');

    return NextResponse.json({
      Sucesso: true,
      Mensagem: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      {
        Sucesso: false,
        Mensagem: 'Erro ao fazer logout',
      },
      { status: 500 },
    );
  }
}

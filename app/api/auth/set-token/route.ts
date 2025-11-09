import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rota para salvar o token no cookie HttpOnly
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          Sucesso: false,
          Mensagem: 'Token não fornecido',
        },
        { status: 400 },
      );
    }

    // Decodifica o token para pegar a data de expiração
    const tokenParts = token.split('.');
    let maxAge = 24 * 60 * 60;

    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString(
            'utf8',
          ),
        );
        if (payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          maxAge = payload.exp - now;
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    }

    // Salva o token em cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge,
      path: '/',
    });

    return NextResponse.json({
      Sucesso: true,
      Mensagem: 'Token salvo com sucesso',
    });
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    return NextResponse.json(
      {
        Sucesso: false,
        Mensagem: 'Erro ao salvar token',
        Detalhe:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}

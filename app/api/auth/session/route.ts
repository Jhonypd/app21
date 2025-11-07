import { ApiResponse } from '@/services/interfaces';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('access_token='));

    const token = match ? match.split('=')[1] : null;

    if (!token) {
      const body: ApiResponse = {
        Resultado: null,
        Sucesso: false,
        Mensagem: 'Sem sessão',
        CodigoRetorno: 401,
        TipoRetorno: 0,
      };
      return NextResponse.json(body, { status: 401 });
    }

    // decodifica payload do JWT (server-side)
    const parts = token.split('.');
    if (parts.length < 2) {
      const body: ApiResponse = {
        Resultado: null,
        Sucesso: false,
        Mensagem: 'Token inválido',
        CodigoRetorno: 401,
        TipoRetorno: 0,
      };
      return NextResponse.json(body, { status: 401 });
    }

    const payloadB64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const buff = Buffer.from(payloadB64, 'base64');
    const payloadJson = buff.toString('utf8');
    let payload: Record<string, unknown> | null = null;
    try {
      payload = JSON.parse(payloadJson) as Record<
        string,
        unknown
      >;
    } catch {
      const body: ApiResponse = {
        Resultado: null,
        Sucesso: false,
        Mensagem: 'Não foi possível decodificar o token',
        CodigoRetorno: 500,
        TipoRetorno: 0,
      };
      return NextResponse.json(body, { status: 500 });
    }

    const perfil = {
      id:
        (payload && (payload['Usu_Id'] as string)) ||
        (payload && (payload['sub'] as string)) ||
        (payload && (payload['id'] as string)) ||
        null,
      nome:
        (payload && (payload['Usu_na'] as string)) ||
        (payload && (payload['name'] as string)) ||
        (payload && (payload['nome'] as string)) ||
        null,
      email:
        (payload && (payload['email'] as string)) || null,
    };

    const body: ApiResponse<typeof perfil> = {
      Resultado: perfil,
      Sucesso: true,
      Mensagem: 'Sessão válida',
      CodigoRetorno: 200,
      TipoRetorno: 0,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const body: ApiResponse = {
      Resultado: null,
      Sucesso: false,
      Mensagem: 'Erro interno',
      Detalhe: String(err),
      CodigoRetorno: 500,
      TipoRetorno: 0,
    };
    return NextResponse.json(body, { status: 500 });
  }
}

import { ApiResponse } from '@/services/interfaces';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      const body: ApiResponse = {
        Resultado: null,
        Sucesso: false,
        Detalhe: null,
        Mensagem: 'Sem sessão ativa',
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
        Detalhe: null,
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
        Detalhe: null,
        Mensagem: 'Não foi possível decodificar o token',
        CodigoRetorno: 500,
        TipoRetorno: 0,
      };
      return NextResponse.json(body, { status: 500 });
    }

    const perfil = {
      id: payload && (payload['Usu_Id'] as string),
      nome: payload && (payload['Usu_na'] as string),
      email: payload && (payload['Email'] as string),
      idp: payload && (payload['Idp'] as string),
      dt_ex:
        payload && new Date(payload['Dt_Ex'] as string),
    };

    const body: ApiResponse<typeof perfil> = {
      Resultado: perfil,
      Sucesso: true,
      Detalhe: null,
      Mensagem: 'Sessão válida',
      CodigoRetorno: 200,
      TipoRetorno: 0,
    };
    debugger;
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

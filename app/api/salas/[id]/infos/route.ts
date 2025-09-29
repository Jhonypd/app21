import { NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface SalaInfosData {
  id: string;
  titulo: string;
  codigo: number;
  criado_por: string;
  privada: boolean;
  totalParticipantes: number;
  nomeDono: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;
    const salaId = id;

    // Verificação 1: Usuário está autenticado?
    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Não autorizado. Faça login para acessar esta sala.',
        },
        { status: 401 },
      );
    }

    // Buscar a sala
    const sala = await prismaClient.sala.findUnique({
      where: {
        id: salaId,
      },
      select: {
        id: true,
        titulo: true,
        codigo: true,
        criado_por: true,
        senha: true,
        participantes: {
          select: {
            pessoa_id: true,
          },
        },
      },
    });

    // Verificação 2: Sala existe?
    if (!sala) {
      return NextResponse.json(
        {
          error:
            'Sala não encontrada. Verifique se o código está correto.',
        },
        { status: 404 },
      );
    }

    // Verificação 3: Usuário tem acesso à sala?
    const isDono = sala.criado_por === userId;
    const isParticipante = sala.participantes.some(
      (p) => p.pessoa_id === userId,
    );
    const temAcesso = isDono || isParticipante;

    if (!temAcesso) {
      return NextResponse.json(
        {
          error: 'Acesso negado.',
          details:
            'Você não tem permissão para acessar esta sala. Contate o administrador da sala',
        },
        { status: 403 },
      );
    }

    // Buscar nome do dono
    const dono = await prismaClient.pessoa.findUnique({
      where: {
        id: sala.criado_por,
      },
      select: {
        nome: true,
      },
    });

    // Formatar dados
    const infosData: SalaInfosData = {
      id: sala.id,
      titulo: sala.titulo,
      codigo: sala.codigo,
      criado_por: sala.criado_por,
      privada: sala.senha ? true : false,
      totalParticipantes: sala.participantes.length,
      nomeDono: dono?.nome || 'Usuário',
    };

    return NextResponse.json(
      { sala: infosData },
      { status: 200 },
    );
  } catch (err) {
    console.error('Erro ao buscar dados da sala:', err);
    return NextResponse.json(
      {
        error:
          'Erro interno do servidor. Tente novamente mais tarde.',
      },
      { status: 500 },
    );
  }
}

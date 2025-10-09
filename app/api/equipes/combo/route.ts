import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    // busca todas as equipes ativas onde o usuário é membro
    const equipes = await prismaClient.equipe.findMany({
      where: {
        inativo: false,
        membros: {
          some: {
            pessoa_id: idUsuario,
          },
        },
      },
      select: {
        id: true,
        nome: true,
        inativo: true,
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json({
      ResultadoOperacao: {
        equipe: equipes,
      },
    });
  } catch (erro) {
    console.error('Erro ao buscar equipes:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

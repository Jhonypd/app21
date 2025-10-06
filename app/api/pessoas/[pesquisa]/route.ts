import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const pesquisa = searchParams.get('pesquisa');
    const excluirIds = searchParams.get('excluirIds');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    if (!pesquisa || pesquisa.trim() === '') {
      return NextResponse.json({
        ResultadoOperacao: { pessoas: [] },
      });
    }

    // IDs para excluir: usuário atual + IDs enviados
    const idsExclusaoUsuario = [idUsuario];
    const idsExclusaoAdicionais = excluirIds
      ? excluirIds.split(',')
      : [];

    const todosIdsParaExcluir = [
      ...idsExclusaoUsuario,
      ...idsExclusaoAdicionais,
    ];

    const pessoas = await prismaClient.pessoa.findMany({
      where: {
        OR: [
          {
            nome: {
              contains: pesquisa,
              mode: 'insensitive',
            },
          },
        ],
        inativo: false,
        id: { notIn: todosIdsParaExcluir },
      },
      select: { id: true, nome: true, inativo: true },
      take: 10,
    });

    return NextResponse.json({
      ResultadoOperacao: { pessoas },
    });
  } catch (erro) {
    console.error('Erro ao buscar pessoas:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

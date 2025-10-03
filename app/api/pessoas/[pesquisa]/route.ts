import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

// app/api/pessoas/pesquisar/route.ts
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

    // Converter string de IDs para array
    const idsParaExcluir = excluirIds
      ? excluirIds.split(',')
      : [];

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
        // EXCLUIR os IDs que já estão selecionados
        ...(idsParaExcluir.length > 0 && {
          id: { notIn: idsParaExcluir },
        }),
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

import { prismaClient } from '@/lib/prisma';
import { Pessoa } from '@/lib/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

type MembroResponse = {
  pessoa: Pick<Pessoa, 'id' | 'nome' | 'inativo'>;
};

type EquipeComMembros = {
  id: string;
  membros: Array<{
    pessoa: Pick<Pessoa, 'id' | 'nome' | 'inativo'>;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;

    // Buscar todos os membros da equipe onde a pessoa não está inativa
    const equipe = (await prismaClient.equipe.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        membros: {
          where: {
            pessoa: {
              inativo: false,
            },
          },
          select: {
            pessoa: {
              select: {
                id: true,
                nome: true,
                inativo: true,
              },
            },
          },
        },
      },
    })) as EquipeComMembros | null;

    if (!equipe) {
      return NextResponse.json(
        {
          erro: 'Equipe não encontrada',
        },
        { status: 404 },
      );
    }

    const pessoas = equipe.membros.map((membro) => ({
      id: membro.pessoa.id,
      nome: membro.pessoa.nome,
      inativo: membro.pessoa.inativo,
    }));

    return NextResponse.json({
      ResultadoOperacao: {
        sucesso: true,
        pessoas,
      },
    });
  } catch (error) {
    console.error(
      'Erro ao buscar membros da equipe:',
      error,
    );
    return NextResponse.json(
      {
        erro: 'Erro ao buscar membros da equipe',
      },
      { status: 500 },
    );
  }
}

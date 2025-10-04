import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { comboProjetos } from '@/app/modules/times/minha-equipes/actions/combo-projetos';

export async function GET(
  req: NextRequest,
  { params }: { params: { equipeId: string } },
) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    const { equipeId } = await params;

    if (!equipeId) {
      return NextResponse.json(
        { erro: 'Id da equipe não fornecido' },
        { status: 400 },
      );
    }

    // Buscar equipe
    const equipe = await prismaClient.equipe.findUnique({
      where: { id: equipeId },
      include: {
        membrosEquipe: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome: true,
                inativo: true,
              },
            },
          },
        },
        projetos: {
          select: { id: true, nome: true, inativo: true },
          where: { inativo: false },
        },
      },
    });

    if (!equipe) {
      return NextResponse.json(
        { erro: 'Equipe não encontrada' },
        { status: 400 },
      );
    }

    // Formatar equipe
    const equipeFormatada = {
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      membrosEquipe: equipe.membrosEquipe.map((m) => ({
        id: m.pessoa.id,
        nome: m.pessoa.nome,
        inativo: m.pessoa.inativo,
        proprietario: m.proprietario,
      }))
    };

    // Buscar projetos do combo (dados puros, não NextResponse)
    const comboProjeto = await comboProjetos({
      idUsuario,
    });

    return NextResponse.json({
      ResultadoOperacao: {
        comboProjeto: comboProjeto,
        equipe: equipeFormatada,
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

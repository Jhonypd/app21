import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { comboProjetos } from '@/app/modules/times/minha-equipes/actions/combo-projetos';

export async function GET(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    // Buscar projetos do combo (dados puros, não NextResponse)
    const comboProjeto = await comboProjetos({
      idUsuario,
      inativo: false,
    });

    return NextResponse.json({
      ResultadoOperacao: {
        comboProjeto: comboProjeto,
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

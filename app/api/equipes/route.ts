import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

// interface EquipesProps {
//   nome: string;
// }

export async function GET(req: NextRequest) {
  try {
    // depois vou adicionar a propriedade que identifica o proprietario da equipe
    const userId = req.headers.get('x-user-id');

    console.log({ userId });

    const equipes = await prismaClient.equipe.findMany({
      where: {},
    });

    return NextResponse.json({ equipes }, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar equipe:', err);
    return NextResponse.json(
      { error: 'Erro inesperado' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface EquipesProps {
  nome: string;
}

export async function POST(req: NextRequest) {
  try {
    // depois vou adicionar a propriedade que identifica o proprietario da equipe
    // const userId = req.headers.get('x-user-id');

    const body: EquipesProps = await req.json();
    const { nome } = body;

    const novaEquipe = await prismaClient.equipe.create({
      data: {
        nome,
      },
    });

    if (!novaEquipe) {
      return NextResponse.json(
        { error: 'Erro ao criar equipe' },
        { status: 500 },
      );
    }

    return NextResponse.json(novaEquipe, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar equipe:', err);
    return NextResponse.json(
      { error: 'Erro inesperado' },
      { status: 500 },
    );
  }
}

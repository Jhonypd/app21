'use server';

import { prismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface ComboProjetosProps {
  idUsuario: string;
  inativo: boolean;
}

export async function comboProjetos({
  idUsuario,
  inativo,
}: ComboProjetosProps) {
  if (!idUsuario) {
    return NextResponse.json(
      { erro: 'ID do usuário não fornecido' },
      { status: 400 },
    );
  }

  try {
    const comboProjetos =
      await prismaClient.projeto.findMany({
        where: {
          participantes: {
            some: { pessoa: { id: idUsuario } },
          },
          inativo,
        },
        select: { id: true, nome: true, inativo: true },
      });

    return comboProjetos;
  } catch (error) {
    console.error(
      'Erro ao carregar combo de projetos para o usuário',
      idUsuario,
      error,
    );
    return NextResponse.json(
      { error: 'Erro ao carregar combos de projetos' },
      { status: 500 },
    );
  }
}

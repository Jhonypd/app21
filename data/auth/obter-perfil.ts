'use server';

import { prismaClient } from '@/lib/prisma';

interface ObterPerfilProps {
  user_id: string;
}

export async function ObterPerfil({
  user_id,
}: ObterPerfilProps) {
  if (!user_id) {
    throw new Error(
      'O id do usuário precisa ser informado',
    );
  }

  const pessoa = await prismaClient.pessoa.findUnique({
    where: { id: user_id },
  });

  if (!pessoa) {
    throw new Error(
      'Não foi possível obter o perfil do usuário.',
    );
  }

  return pessoa;
}

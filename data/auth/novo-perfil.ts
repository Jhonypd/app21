'use server';

import { prismaClient } from '@/lib/prisma';

interface NovoPerfilProps {
  user_id: string;
  nome: string;
}

export async function NovoPerfil({
  user_id,
  nome,
}: NovoPerfilProps) {
  if (!user_id) {
    throw new Error(
      'O id do usuário precisa ser informado',
    );
  }

  if (!nome) {
    throw new Error(
      'O id do usuário precisa ser informado',
    );
  }

  const pessoa = await prismaClient.pessoa.create({
    data: { id: user_id, user_id: user_id, nome: nome },
  });

  if (!pessoa) {
    throw new Error(
      'Não foi possível criar o perfil do usuário.',
    );
  }

  return pessoa;
}

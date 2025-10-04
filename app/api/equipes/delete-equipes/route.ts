import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');
    const ids = req.headers.get('ids');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    if (!ids) {
      return NextResponse.json(
        { erro: 'IDs das equipes não fornecidos' },
        { status: 400 },
      );
    }

    const idsArray = ids.split(',');

    // Usando transação
    const result = await prismaClient.$transaction(
      async (tx) => {
        // Verificar se as equipes existem
        const equipesExistentes = await tx.equipe.findMany({
          where: {
            id: { in: idsArray },
          },
          select: {
            id: true,
            nome: true,
          },
        });

        if (equipesExistentes.length === 0) {
          throw new Error(
            'Nenhuma equipe encontrada com os IDs fornecidos',
          );
        }

        // Remover os membros das equipes
        await tx.membroEquipe.deleteMany({
          where: {
            equipe_id: { in: idsArray },
          },
        });

        // Deletar as equipes
        const equipesDeletadas = await tx.equipe.deleteMany(
          {
            where: {
              id: { in: idsArray },
            },
          },
        );

        return {
          sucesso: true,
          mensagem: `${equipesDeletadas.count} equipe(s) deletada(s) com sucesso`,
          equipesDeletadas: equipesDeletadas.count,
        };
      },
    );

    return NextResponse.json({
      ResultadoOperacao: result,
    });
  } catch (erro) {
    console.error('Erro ao deletar equipes:', erro);

    // Se foi um erro lançado dentro da transação
    if (erro instanceof Error) {
      if (
        erro.message.includes('Nenhuma equipe encontrada')
      ) {
        return NextResponse.json(
          { erro: erro.message },
          { status: 404 },
        );
      }

      if (erro.message.includes('foreign key constraint')) {
        return NextResponse.json(
          {
            erro: 'Não é possível deletar equipes que possuem projetos associados. Remova primeiro as associações.',
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

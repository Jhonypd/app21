import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface AtualizarEquipeProps {
  id: string;
  nome: string;
  inativo: boolean;
  projetosAdicionar: string[];
  projetosRemover: string[];
  membrosAdicionar: string[];
  membrosRemover: string[];
}

export async function PUT(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');
    console.log(idUsuario);
    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    const body: AtualizarEquipeProps = await req.json();
    const {
      id,
      nome,
      inativo,
      projetosAdicionar = [],
      projetosRemover = [],
      membrosAdicionar = [],
      membrosRemover = [],
    } = body;

    // Validar dados obrigatórios
    if (!id) {
      return NextResponse.json(
        { erro: 'ID da equipe é obrigatório' },
        { status: 400 },
      );
    }

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { erro: 'Nome da equipe é obrigatório' },
        { status: 400 },
      );
    }

    // Verificar se a equipe existe
    const equipeExistente =
      await prismaClient.equipe.findUnique({
        where: { id },
      });

    if (!equipeExistente) {
      return NextResponse.json(
        { erro: 'Equipe não encontrada' },
        { status: 404 },
      );
    }

    // Verificar se já existe outra equipe com mesmo nome (excluindo a atual)
    const equipeComMesmoNome =
      await prismaClient.equipe.findFirst({
        where: {
          nome: nome.trim(),
          inativo: false,
          id: { not: id },
        },
      });

    if (equipeComMesmoNome) {
      return NextResponse.json(
        { erro: 'Já existe outra equipe com este nome' },
        { status: 409 },
      );
    }

    // Atualizar a equipe com transação
    await prismaClient.$transaction(async (prisma) => {
      // 1. Atualizar dados básicos da equipe
      await prisma.equipe.update({
        where: { id },
        data: {
          nome: nome.trim(),
          inativo,
        },
      });

      // 2. Processar membros para REMOVER
      if (membrosRemover.length > 0) {
        // Não remove o proprietário
        await prisma.membroEquipe.deleteMany({
          where: {
            equipe_id: id,
            pessoa_id: { in: membrosRemover },
            proprietario: false,
          },
        });
      }

      // 3. Processar membros para ADICIONAR
      if (membrosAdicionar.length > 0) {
        const membrosUnicos = [
          ...new Set(membrosAdicionar),
        ];

        for (const membroId of membrosUnicos) {
          // Verificar se a pessoa existe, está ativa e ainda não é membro
          const pessoaExistente =
            await prisma.pessoa.findUnique({
              where: { id: membroId, inativo: false },
            });

          const jaEhMembro =
            await prisma.membroEquipe.findFirst({
              where: {
                equipe_id: id,
                pessoa_id: membroId,
              },
            });

          if (pessoaExistente && !jaEhMembro) {
            await prisma.membroEquipe.create({
              data: {
                equipe_id: id,
                pessoa_id: membroId,
                proprietario: false,
              },
            });
          }
        }
      }

      // 4. Processar projetos para REMOVER
      if (projetosRemover.length > 0) {
        await prisma.equipe.update({
          where: { id },
          data: {
            projetos: {
              disconnect: projetosRemover.map((id) => ({
                id,
              })),
            },
          },
        });
      }

      // 5. Processar projetos para ADICIONAR
      if (projetosAdicionar.length > 0) {
        // Verificar se os projetos existem e estão ativos
        const projetosExistentes =
          await prisma.projeto.findMany({
            where: {
              id: { in: projetosAdicionar },
              inativo: false,
            },
            select: { id: true },
          });

        const idsProjetosValidos = projetosExistentes.map(
          (p) => p.id,
        );

        if (idsProjetosValidos.length > 0) {
          await prisma.equipe.update({
            where: { id },
            data: {
              projetos: {
                connect: idsProjetosValidos.map((id) => ({
                  id,
                })),
              },
            },
          });
        }
      }
    });

    return NextResponse.json(
      {
        ResultadoOperacao: {
          sucesso: true,
          mensagem: 'Equipe atualizada com sucesso',
          id: id,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Erro ao atualizar equipe:', err);

    if (
      err instanceof Error &&
      err.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { erro: 'Já existe uma equipe com este nome' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        erro: 'Erro interno do servidor ao atualizar equipe',
      },
      { status: 500 },
    );
  }
}

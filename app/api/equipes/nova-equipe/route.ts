// app/api/equipes/nova-equipe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface NovaEquipeProps {
  nome: string;
  projetos: string[];
  membros: string[];
}

export async function POST(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    const body: NovaEquipeProps = await req.json();
    const { nome, projetos, membros = [] } = body;

    // Validar dados obrigatórios
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { erro: 'Nome da equipe é obrigatório' },
        { status: 400 },
      );
    }

    // Verificar se já existe equipe com mesmo nome
    const equipeExistente =
      await prismaClient.equipe.findFirst({
        where: {
          nome: nome.trim(),
          inativo: false,
        },
      });

    if (equipeExistente) {
      return NextResponse.json(
        { erro: 'Já existe uma equipe com este nome' },
        { status: 409 },
      );
    }

    // Criar a nova equipe com transação para garantir consistência
    const novaEquipe = await prismaClient.$transaction(
      async (prisma) => {
        // 1. Criar a equipe
        const equipe = await prisma.equipe.create({
          data: {
            nome: nome.trim(),
            inativo: false,
          },
        });

        // 2. Adicionar o usuário logado como proprietário (administrador)
        await prisma.membroEquipe.create({
          data: {
            equipe_id: equipe.id,
            pessoa_id: idUsuario,
            proprietario: true,
          },
        });

        // 3. Adicionar outros membros se houver (excluindo duplicatas e o próprio criador)
        if (membros && membros.length > 0) {
          const membrosUnicos = [
            ...new Set(membros),
          ].filter((membroId) => membroId !== idUsuario);

          for (const membroId of membrosUnicos) {
            // Verificar se a pessoa existe e está ativa
            const pessoaExistente =
              await prisma.pessoa.findUnique({
                where: { id: membroId, inativo: false },
              });

            if (pessoaExistente) {
              await prisma.membroEquipe.create({
                data: {
                  equipe_id: equipe.id,
                  pessoa_id: membroId,
                  proprietario: false,
                },
              });
            }
          }
        }

        // 4. Vincular projetos se houver
        if (projetos && projetos.length > 0) {
          // Verificar se os projetos existem e estão ativos
          const projetosExistentes =
            await prisma.projeto.findMany({
              where: {
                id: { in: projetos },
                inativo: false,
              },
              select: { id: true },
            });

          const idsProjetosValidos = projetosExistentes.map(
            (p) => p.id,
          );

          if (idsProjetosValidos.length > 0) {
            await prisma.equipe.update({
              where: { id: equipe.id },
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

        return equipe;
      },
    );

    return NextResponse.json(
      {
        ResultadoOperacao: {
          sucesso: true,
          mensagem: 'Equipe criada com sucesso',
          id: novaEquipe.id,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Erro ao criar equipe:', err);

    // Erro específico para violação de constraint única
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
      { erro: 'Erro interno do servidor ao criar equipe' },
      { status: 500 },
    );
  }
}

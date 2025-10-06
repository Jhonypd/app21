import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface AtualizarEquipeProps {
  id: string;
  nome: string;
  inativo: boolean;
  membrosAdicionar: string[];
  membrosRemover: string[];
}

export async function PUT(req: NextRequest) {
  try {
    const idUsuario = req.headers.get('x-user-id');

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

    // Verificar se a equipe existe E se o usuário é o administrador
    const equipeExistente =
      await prismaClient.equipe.findUnique({
        where: { id },
        include: {
          membrosEquipe: {
            include: {
              pessoa: true,
            },
          },
        },
      });

    if (!equipeExistente) {
      return NextResponse.json(
        { erro: 'Equipe não encontrada' },
        { status: 404 },
      );
    }

    // Verificar se o usuário atual é o administrador da equipe
    const usuarioEhAdministrador =
      equipeExistente.membrosEquipe.some(
        (m) => m.proprietario && m.pessoa_id === idUsuario,
      );

    if (!usuarioEhAdministrador) {
      return NextResponse.json(
        {
          erro: 'Acesso negado. Apenas o administrador da equipe pode realizar alterações.',
        },
        { status: 403 },
      );
    }

    // Encontrar o administrador atual
    const administradorAtual =
      equipeExistente.membrosEquipe.find(
        (m) => m.proprietario,
      );

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
        // NÃO remove o administrador atual (sempre protege o admin)
        const membrosParaRemover = membrosRemover.filter(
          (membroId) =>
            membroId !== administradorAtual?.pessoa_id,
        );

        if (membrosParaRemover.length > 0) {
          await prisma.membroEquipe.deleteMany({
            where: {
              equipe_id: id,
              pessoa_id: { in: membrosParaRemover },
              proprietario: false, // Garante que nunca remove administradores
            },
          });
        }
      }

      // 3. Processar membros para ADICIONAR
      if (membrosAdicionar.length > 0) {
        const membrosUnicos = [
          ...new Set(membrosAdicionar),
        ];

        for (const membroId of membrosUnicos) {
          // Verificar se a pessoa existe e está ativa
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
                proprietario: false, // Novos membros NUNCA são administradores
              },
            });
          }
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

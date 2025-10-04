import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface AtualizarEquipeProps {
  id: string;
  nome: string;
  inativo: boolean;
  membrosAdicionar: string[];
  membrosRemover: string[];
  novoAdministradorId?: string;
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
      novoAdministradorId,
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

    // Encontrar o administrador atual
    const administradorAtual =
      equipeExistente.membrosEquipe.find(
        (m) => m.proprietario,
      );

    // Validar transferência de administração
    if (novoAdministradorId) {
      // Verificar se o novo administrador existe e está ativo
      const novoAdministrador =
        await prismaClient.pessoa.findUnique({
          where: {
            id: novoAdministradorId,
            inativo: false,
          },
        });

      if (!novoAdministrador) {
        return NextResponse.json(
          {
            erro: 'Novo administrador não encontrado ou está inativo',
          },
          { status: 404 },
        );
      }

      // Verificar se o novo administrador já é membro da equipe
      const jaEhMembro = equipeExistente.membrosEquipe.find(
        (m) => m.pessoa_id === novoAdministradorId,
      );

      if (!jaEhMembro) {
        return NextResponse.json(
          {
            erro: 'O novo administrador deve ser membro da equipe antes da transferência',
          },
          { status: 400 },
        );
      }

      // Não permitir transferência para o próprio administrador atual
      if (
        administradorAtual &&
        administradorAtual.pessoa_id === novoAdministradorId
      ) {
        return NextResponse.json(
          {
            erro: 'Esta pessoa já é o administrador da equipe',
          },
          { status: 400 },
        );
      }
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

      // 2. Processar TRANSFERÊNCIA DE ADMINISTRAÇÃO (se solicitado)
      if (novoAdministradorId) {
        // Remover privilégio de administrador do atual (se existir)
        if (administradorAtual) {
          await prisma.membroEquipe.update({
            where: {
              id: administradorAtual.id,
            },
            data: {
              proprietario: false,
            },
          });
        }

        // Atribuir privilégio de administrador ao novo
        await prisma.membroEquipe.updateMany({
          where: {
            equipe_id: id,
            pessoa_id: novoAdministradorId,
          },
          data: {
            proprietario: true,
          },
        });
      }

      // 3. Processar membros para REMOVER
      if (membrosRemover.length > 0) {
        // Não remove o administrador atual (a menos que seja transferência)
        const membrosParaRemover =
          administradorAtual && !novoAdministradorId
            ? membrosRemover.filter(
                (membroId) =>
                  membroId !== administradorAtual.pessoa_id,
              )
            : membrosRemover;

        if (membrosParaRemover.length > 0) {
          await prisma.membroEquipe.deleteMany({
            where: {
              equipe_id: id,
              pessoa_id: { in: membrosParaRemover },
              // Se houver transferência, pode remover o administrador anterior
              ...(novoAdministradorId
                ? {}
                : { proprietario: false }),
            },
          });
        }
      }

      // 4. Processar membros para ADICIONAR
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
                proprietario: false, // Novos membros não são administradores por padrão
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
          mensagem: novoAdministradorId
            ? 'Equipe atualizada e administração transferida com sucesso'
            : 'Equipe atualizada com sucesso',
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

import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface NovoProjetoProps {
  nome: string;
  idEquipe: string;
  idGerente?: string;
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

    const body: NovoProjetoProps = await req.json();
    const { nome, idEquipe, idGerente } = body;

    // Validar dados obrigatórios
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { erro: 'Nome do projeto é obrigatório' },
        { status: 400 },
      );
    }

    if (!idEquipe) {
      return NextResponse.json(
        { erro: 'ID da equipe é obrigatório' },
        { status: 400 },
      );
    }

    // Validar tamanho do nome
    if (
      nome.trim().length < 3 ||
      nome.trim().length > 100
    ) {
      return NextResponse.json(
        {
          erro: 'O nome do projeto deve ter entre 3 e 100 caracteres',
        },
        { status: 400 },
      );
    }

    // Verificar se a equipe existe
    const equipeExiste =
      await prismaClient.equipe.findUnique({
        where: { id: idEquipe },
      });

    if (!equipeExiste) {
      return NextResponse.json(
        { erro: 'Equipe não encontrada' },
        { status: 404 },
      );
    }

    // Se houver gerente, verificar se ele existe e é membro da equipe
    if (idGerente) {
      const gerenteNaEquipe =
        await prismaClient.membroEquipe.findFirst({
          where: {
            pessoa_id: idGerente,
            equipe_id: idEquipe,
          },
        });

      if (!gerenteNaEquipe) {
        return NextResponse.json(
          {
            erro: 'O gerente selecionado não é membro da equipe',
          },
          { status: 400 },
        );
      }
    }

    // Verificar se já existe projeto com mesmo nome na mesma equipe
    const projetoExistente =
      await prismaClient.projeto.findFirst({
        where: {
          nome: nome.trim(),
          equipe_id: idEquipe,
          inativo: false,
        },
      });

    if (projetoExistente) {
      return NextResponse.json(
        {
          erro: 'Já existe um projeto com este nome na mesma equipe',
        },
        { status: 409 },
      );
    }

    // Criar a nova projeto com transação para garantir consistência
    const novoProjeto = await prismaClient.$transaction(
      async (prisma) => {
        // 1. Criar a projeto
        const projeto = await prisma.projeto.create({
          data: {
            nome: nome.trim(),
            equipe_id: idEquipe,
            inativo: false,
            gerente_id: idGerente,
          },
        });

        return projeto;
      },
    );

    return NextResponse.json(
      {
        ResultadoOperacao: {
          sucesso: true,
          mensagem: 'Projeto criado com sucesso',
          id: novoProjeto.id,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Erro ao criar projeto:', err);

    // Erro específico para violação de constraint única
    if (
      err instanceof Error &&
      err.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        {
          erro: 'Já existe um projeto com este nome na mesma equipe',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { erro: 'Erro interno do servidor ao criar projeto' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { projetoId: string } },
) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    const { projetoId } = await params;

    if (!projetoId) {
      return NextResponse.json(
        { erro: 'Id do projeto não fornecido' },
        { status: 400 },
      );
    }

    // Verificar se o usuário tem acesso ao projeto
    const projeto = await prismaClient.projeto.findUnique({
      where: { id: projetoId },
      select: {
        id: true,
        nome: true,
        inativo: true,
        equipe_id: true,
        gerente_id: true,
        equipe: {
          select: {
            id: true,
            nome: true,
            inativo: true,
          },
        },
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { erro: 'Projeto não encontrado' },
        { status: 404 },
      );
    }

    // Verificar se o usuário tem acesso ao projeto (é gerente)
    const temAcesso = projeto.gerente_id === idUsuario;

    if (!temAcesso) {
      return NextResponse.json(
        {
          erro: 'Acesso negado. Usuário sem permissão para visualizar os dados do projeto.',
        },
        { status: 403 },
      );
    }

    // Formatar o projeto no mesmo formato da listagem
    const projetoFormatado = {
      id: projeto.id,
      nome: projeto.nome,
      inativo: projeto.inativo,
      equipe_id: projeto.equipe_id,
      gerente_id: projeto.gerente_id,
      equipe: {
        id: projeto.equipe.id,
        nome: projeto.equipe.nome,
        inativo: projeto.equipe.inativo,
      },
    };

    return NextResponse.json({
      ResultadoOperacao: {
        projeto: projetoFormatado,
      },
    });
  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

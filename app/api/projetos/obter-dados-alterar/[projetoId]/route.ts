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

    // Primeiro verificar se o usuário é o proprietário do projeto
    const equipeComProprietario =
      await prismaClient.projeto.findUnique({
        where: { id: projetoId },
        include: {
          participantes: {
            where: {
              role: { in: [0, 1] },
              pessoa_id: idUsuario,
            },
            include: {
              pessoa: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
      });

    // Verificar se o usuário é o proprietário
    if (
      !equipeComProprietario ||
      equipeComProprietario.participantes.length === 0
    ) {
      return NextResponse.json(
        {
          erro: 'Acesso negado. Usuário sem permissão para visualizar os dados do projeto.',
        },
        { status: 403 },
      );
    }

    // Agora buscar a equipe completa (sem o usuário atual na lista de membros)
    const equipe = await prismaClient.projeto.findUnique({
      where: { id: projetoId },
      include: {
        participantes: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome: true,
                inativo: true,
              },
            },
          },
          where: {
            // Remove o usuário atual da lista de membros
            pessoa_id: { not: idUsuario },
          },
        },
      },
    });

    if (!equipe) {
      return NextResponse.json(
        { erro: 'Equipe não encontrada' },
        { status: 404 },
      );
    }

    // Formatar equipe
    const projetoFormatado = {
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      membrosEquipe: equipe.participantes.map((m) => ({
        id: m.pessoa.id,
        nome: m.pessoa.nome,
        inativo: m.pessoa.inativo,
        cargo: m.role,
      })),
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

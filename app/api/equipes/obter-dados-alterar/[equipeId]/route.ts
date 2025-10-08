import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { equipeId: string } },
) {
  try {
    const idUsuario = req.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    const { equipeId } = await params;

    if (!equipeId) {
      return NextResponse.json(
        { erro: 'Id da equipe não fornecido' },
        { status: 400 },
      );
    }

    // Primeiro verificar se o usuário é o proprietário da equipe
    const equipeComProprietario =
      await prismaClient.equipe.findUnique({
        where: { id: equipeId },
        include: {
          membros: {
            where: {
              proprietario: true,
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
      equipeComProprietario.membros.length === 0
    ) {
      return NextResponse.json(
        {
          erro: 'Acesso negado. Apenas o proprietário da equipe pode visualizar estes dados.',
        },
        { status: 403 },
      );
    }

    // Agora buscar a equipe completa (sem o usuário atual na lista de membros)
    const equipe = await prismaClient.equipe.findUnique({
      where: { id: equipeId },
      include: {
        membros: {
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
    const equipeFormatada = {
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      membrosEquipe: equipe.membros.map((m) => ({
        id: m.pessoa.id,
        nome: m.pessoa.nome,
        inativo: m.pessoa.inativo,
        proprietario: m.proprietario,
      })),
    };

    return NextResponse.json({
      ResultadoOperacao: {
        equipe: equipeFormatada,
      },
    });
  } catch (erro) {
    console.error('Erro ao buscar equipes:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

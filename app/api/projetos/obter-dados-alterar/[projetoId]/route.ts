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
        // equipe: {
        //   select: {
        //     id: true,
        //     nome: true,
        //     inativo: true,
        //   },
        // },
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { erro: 'Projeto não encontrado' },
        { status: 404 },
      );
    }

    const equipes = await prismaClient.equipe.findMany({
      where: {
        inativo: false,
        membros: {
          some: {
            pessoa_id: idUsuario,
          },
        },
      },
      select: {
        id: true,
        nome: true,
        inativo: true,
      },
      orderBy: { nome: 'asc' },
    });

    const membrosEquipe =
      await prismaClient.equipe.findUnique({
        where: {
          id: projeto.equipe_id,
        },
        select: {
          id: true,
          membros: {
            where: {
              pessoa: {
                inativo: false,
              },
            },
            select: {
              pessoa: {
                select: {
                  id: true,
                  nome: true,
                  inativo: true,
                },
              },
            },
          },
        },
      });

    if (!membrosEquipe) {
      return NextResponse.json(
        {
          erro: 'Equipe não encontrada',
        },
        { status: 404 },
      );
    }

    const pessoas = membrosEquipe.membros.map((membro) => ({
      id: membro.pessoa.id,
      nome: membro.pessoa.nome,
      inativo: membro.pessoa.inativo,
    }));

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
      equipeId: projeto.equipe_id,
      gerenteId: projeto.gerente_id,
    };

    return NextResponse.json({
      ResultadoOperacao: {
        Projeto: projetoFormatado,
        ComboEquipes: equipes,
        ComboGerentes: pessoas,
      },
      sucesso: true,
      codigo: 200, //tentar sempre colocar o erro da exception aqui
      detalhes: null, // detalhes adicionais, se houver como erros de banco de dados
      mensagem: 'Operação realizada com sucesso', // se der erro colocar a mensagem do erro amigável
      tipoRetorno: 0, // 0 - sucesso, 1 - parcial, 2 - erro
    });
  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

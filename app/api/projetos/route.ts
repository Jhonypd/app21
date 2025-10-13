import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(requisicao: NextRequest) {
  try {
    const idUsuario = requisicao.headers.get('x-user-id');

    if (!idUsuario) {
      return NextResponse.json(
        { erro: 'ID do usuário não fornecido' },
        { status: 400 },
      );
    }

    // Obter parâmetros da query string
    const { searchParams } = new URL(requisicao.url);
    const dono = searchParams.get('dono') === 'true'; // ajustado para boolean
    const campoPesquisa = searchParams.get('campoPesquisa');
    const inativo = searchParams.get('inativo');

    const pagina = parseInt(
      searchParams.get('pagina') || '0',
    );
    const limite = parseInt(
      searchParams.get('limite') || '10',
    ) as 10 | 20 | 30 | 50 | 100;

    // Construir cláusula where para projetos
    const onde: any = {
      OR: [
        // Projetos onde o usuário é gerente
        { gerente_id: idUsuario },
        // Projetos onde o usuário é membro da equipe
        {
          equipe: {
            membros: {
              some: {
                pessoa_id: idUsuario,
              },
            },
          },
        },
      ],
    };

    // Filtro por proprietário (dono)
    if (dono) {
      // Se dono=true, buscar apenas projetos onde o usuário é gerente OU é proprietário da equipe
      onde.OR = [
        { gerente_id: idUsuario },
        {
          equipe: {
            membros: {
              some: {
                pessoa_id: idUsuario,
                proprietario: true,
              },
            },
          },
        },
      ];
    }

    // Filtro por nome do projeto (campoPesquisa)
    if (campoPesquisa) {
      onde.nome = {
        contains: campoPesquisa,
        mode: 'insensitive',
      };
    }

    // Filtro por status inativo
    if (inativo !== null) {
      onde.inativo = inativo === 'true';
    }

    // Calcular paginação
    const pular = pagina * limite;

    // Buscar total de itens (para calcular páginas)
    const totalItens = await prismaClient.projeto.count({
      where: onde,
    });

    // Buscar projetos com paginação
    const projetos = await prismaClient.projeto.findMany({
      where: onde,
      skip: pular,
      take: limite,
      orderBy: {
        id: 'desc',
      },
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
            membros: {
              select: {
                pessoa: {
                  select: {
                    id: true,
                    nome: true,
                    inativo: true,
                  },
                },
                proprietario: true,
              },
            },
          },
        },
      },
    });

    // Formatar os projetos no formato desejado
    const projetosFormatados = projetos.map((projeto) => {
      return {
        id: projeto.id,
        nome: projeto.nome,
        inativo: projeto.inativo,
        equipe_id: projeto.equipe_id,
        gerente_id: projeto.gerente_id,
        equipe: {
          id: projeto.equipe.id,
          nome: projeto.equipe.nome,
          inativo: projeto.equipe.inativo,
          pessoas: projeto.equipe.membros.map((membro) => ({
            id: membro.pessoa.id,
            nome: membro.pessoa.nome,
            inativo: false,
            proprietario: membro.proprietario,
          })),
        },
      };
    });

    // Calcular totais de páginas
    const totalPaginas = Math.ceil(totalItens / limite);
    const paginaAtual = pagina;

    const resposta = {
      ResultadoOperacao: {
        ListaGrid: { projetos: projetosFormatados },
        paginacao: {
          totalItens,
          paginaAtual,
          totalPaginas,
          itensPorPagina: limite,
          temProximaPagina: paginaAtual < totalPaginas - 1,
          temPaginaAnterior: paginaAtual > 0,
        },
      },
    };

    return NextResponse.json(resposta, { status: 200 });
  } catch (erro) {
    console.error('Erro ao buscar projetos:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

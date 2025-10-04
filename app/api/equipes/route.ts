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
    const dono = searchParams.get('dono') === 'true';
    const campoPesquisa = searchParams.get('campoPesquisa');
    const inativo = searchParams.get('inativo');
    // const dataInicio = searchParams.get('dataInicio');
    // const dataFim = searchParams.get('dataFim');
    const pagina = parseInt(
      searchParams.get('pagina') || '0',
    );
    const limite = parseInt(
      searchParams.get('limite') || '10',
    ) as 10 | 20 | 30 | 50 | 100;
    console.log({ inativo });
    // Construir cláusula where
    const onde: any = {};

    // Filtro por proprietário ou participação
    if (dono) {
      // Buscar apenas equipes onde o usuário é proprietário
      onde.membrosEquipe = {
        some: {
          pessoa_id: idUsuario,
          proprietario: true,
        },
      };
    } else {
      // Buscar equipes onde o usuário é membro (proprietário ou não)
      onde.membrosEquipe = {
        some: {
          pessoa_id: idUsuario,
        },
      };
    }

    // Filtro por nome (campoPesquisa)
    if (campoPesquisa) {
      onde.nome = {
        contains: campoPesquisa,
        mode: 'insensitive',
      };
    }

    // Filtro por status
    if (inativo !== null) {
      onde.inativo = inativo;
    }

    // Calcular paginação
    const pular = pagina * limite;

    // Buscar total de itens (para calcular páginas)
    const totalItens = await prismaClient.equipe.count({
      where: onde,
    });

    // Buscar equipes com paginação
    const equipes = await prismaClient.equipe.findMany({
      where: onde,
      skip: pular,
      take: limite,
      orderBy: {
        id: 'desc',
      },
      include: {
        membrosEquipe: {
          include: {
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

    // Formatar as equipes no formato desejado
    const equipesFormatadas = equipes.map((equipe) => ({
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      membrosEquipe: equipe.membrosEquipe.map((membro) => ({
        id: membro.pessoa.id,
        nome: membro.pessoa.nome,
        inativo: membro.pessoa.inativo,
        proprietario: membro.proprietario,
      })),
    }));

    // Calcular totais de páginas
    const totalPaginas = Math.ceil(totalItens / limite);
    const paginaAtual = pagina;

    const resposta = {
      ResultadoOperacao: {
        ListaGrid: [
          {
            equipes: equipesFormatadas,
          },
        ],
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
    console.error('Erro ao buscar equipes:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

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
    const dono = searchParams.get('dono') === '0';
    const campoPesquisa = searchParams.get('campoPesquisa');
    const inativo = searchParams.get('inativo');

    const pagina = parseInt(
      searchParams.get('pagina') || '0',
    );
    const limite = parseInt(
      searchParams.get('limite') || '10',
    ) as 10 | 20 | 30 | 50 | 100;

    // Construir cláusula where
    const onde: any = {};

    // Filtro por proprietário ou participação
    if (dono) {
      // Buscar apenas equipes onde o usuário é proprietário
      onde.participantes = {
        some: {
          pessoa_id: idUsuario,
          role: 1,
        },
      };
    } else {
      // Buscar equipes onde o usuário é membro (proprietário ou não)
      onde.participantes = {
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
      onde.inativo = inativo === 'false' ? false : true;
    }

    // Calcular paginação
    const pular = pagina * limite;

    // Buscar total de itens (para calcular páginas)
    const totalItens = await prismaClient.projeto.count({
      where: onde,
    });

    // Buscar equipes com paginação
    const projetos = await prismaClient.projeto.findMany({
      where: onde,
      skip: pular,
      take: limite,
      orderBy: {
        id: 'desc',
      },
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
        },
      },
    });

    // Formatar as equipes no formato desejado
    const projetosFormatadas = projetos.map((equipe) => ({
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      participantes: equipe.participantes.map((membro) => ({
        id: membro.pessoa.id,
        nome: membro.pessoa.nome,
        inativo: membro.pessoa.inativo,
        cargo: membro.role,
      })),
    }));

    // Calcular totais de páginas
    const totalPaginas = Math.ceil(totalItens / limite);
    const paginaAtual = pagina;

    const resposta = {
      ResultadoOperacao: {
        ListaGrid: [
          {
            projetos: projetosFormatadas,
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

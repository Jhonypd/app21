import { NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

// Interface do que o frontend realmente usa
interface SalaFrontend {
  id: string;
  codigo: number;
  titulo: string;
  criado_por: string;
  inativo: boolean;
  protegida: boolean;
  data_criacao: string; // Já como string ISO
  data_alteracao: string; // Já como string ISO
  totalParticipantes: number;
  totalVotos: number;
  nomeDono: string;
}

export async function GET(
  req: Request,
): Promise<NextResponse> {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 },
      );
    }

    // Buscar as salas com apenas os dados necessários
    const salas = await prismaClient.sala.findMany({
      where: {
        OR: [
          { criado_por: userId },
          {
            participantes: {
              some: {
                pessoa_id: userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        codigo: true,
        titulo: true,
        criado_por: true,
        inativo: true,
        senha: true,
        data_criacao: true,
        data_alteracao: true,
        // Apenas contar participantes e votos, sem trazer todos os dados
        participantes: {
          select: {
            pessoa_id: true, // Apenas o ID para contar
          },
        },
        votos: {
          select: {
            id: true, // Apenas o ID para contar
          },
        },
      },
      orderBy: {
        data_criacao: 'desc',
      },
    });

    // Coletar IDs dos donos para buscar nomes
    const donosIds = [
      ...new Set(salas.map((sala) => sala.criado_por)),
    ];

    // Buscar nomes dos donos em uma única query
    const donos = await prismaClient.pessoa.findMany({
      where: {
        id: {
          in: donosIds,
        },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    // Criar mapa para acesso rápido aos nomes
    const donosMap = new Map(
      donos.map((dono) => [dono.id, dono.nome]),
    );

    // Formatar dados para o frontend
    const salasFormatadas: SalaFrontend[] = salas.map(
      (sala) => ({
        id: sala.id,
        codigo: sala.codigo,
        titulo: sala.titulo,
        criado_por: sala.criado_por,
        inativo: sala.inativo,
        protegida: sala.senha ? true : false,
        data_criacao: sala.data_criacao.toISOString(),
        data_alteracao: sala.data_alteracao.toISOString(),
        totalParticipantes: sala.participantes.length,
        totalVotos: sala.votos.length,
        nomeDono:
          donosMap.get(sala.criado_por) || 'Usuário',
      }),
    );

    return NextResponse.json(
      { salas: salasFormatadas },
      { status: 200 },
    );
  } catch (err) {
    console.error('Erro ao buscar salas:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

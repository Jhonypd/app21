// app/api/salas/[id]/auth/route.ts
import { NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

interface SalaAuthResponse {
  autorizado: boolean;
  precisaSenha?: boolean;
  erro?: string;
  sala?: {
    id: string;
    titulo: string;
    codigo: number;
    criado_por: string;
    privada: boolean;
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;
    const salaId = id;
    const { senha } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Não autorizado. Faça login para acessar esta sala.',
        },
        { status: 401 },
      );
    }

    // Buscar a sala
    const sala = await prismaClient.sala.findUnique({
      where: {
        id: salaId,
      },
      select: {
        id: true,
        titulo: true,
        codigo: true,
        criado_por: true,
        senha: true,
        participantes: {
          select: {
            pessoa_id: true,
          },
        },
      },
    });

    if (!sala) {
      return NextResponse.json(
        { error: 'Sala não encontrada.' },
        { status: 404 },
      );
    }

    const isDono = sala.criado_por === userId;
    const isParticipante = sala.participantes.some(
      (p) => p.pessoa_id === userId,
    );

    // Se já é dono ou participante, acesso liberado
    if (isDono || isParticipante) {
      return NextResponse.json({
        autorizado: true,
        sala: {
          id: sala.id,
          titulo: sala.titulo,
          codigo: sala.codigo,
          criado_por: sala.criado_por,
          privada: !!sala.senha,
        },
      });
    }

    // Se a sala é pública, adicionar como participante
    if (!sala.senha) {
      await prismaClient.participantesSala.create({
        // Nome correto
        data: {
          sala_id: sala.id,
          pessoa_id: userId,
        },
      });

      return NextResponse.json({
        autorizado: true,
        sala: {
          id: sala.id,
          titulo: sala.titulo,
          codigo: sala.codigo,
          criado_por: sala.criado_por,
          privada: false,
        },
      });
    }

    // Se a sala é privada e não tem senha fornecida
    if (sala.senha && !senha) {
      return NextResponse.json({
        autorizado: false,
        precisaSenha: true,
        sala: {
          id: sala.id,
          titulo: sala.titulo,
          codigo: sala.codigo,
          criado_por: sala.criado_por,
          privada: true,
        },
      });
    }

    // Verificar senha se fornecida
    if (sala.senha && senha) {
      const senhaCorreta = sala.senha === senha;

      if (senhaCorreta) {
        // Adicionar usuário como participante
        await prismaClient.participantesSala.create({
          // Nome correto
          data: {
            sala_id: sala.id,
            pessoa_id: userId,
          },
        });

        return NextResponse.json({
          autorizado: true,
          sala: {
            id: sala.id,
            titulo: sala.titulo,
            codigo: sala.codigo,
            criado_por: sala.criado_por,
            privada: true,
          },
        });
      } else {
        return NextResponse.json({
          autorizado: false,
          precisaSenha: true,
          erro: 'Senha incorreta. Tente novamente.',
          sala: {
            id: sala.id,
            titulo: sala.titulo,
            codigo: sala.codigo,
            criado_por: sala.criado_por,
            privada: true,
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Erro inesperado na autenticação.' },
      { status: 400 },
    );
  } catch (err) {
    console.error('Erro na autenticação da sala:', err);
    return NextResponse.json(
      {
        error:
          'Erro interno do servidor. Tente novamente mais tarde.',
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prismaClient } from '@/lib/prisma';

interface RoomsProps {
  titulo: string;
  senha?: string | null;
  salaPrivada: boolean;
}

async function geradorCodigoUnico() {
  const ultimoCodigo = await prismaClient.sala.findFirst({
    select: { codigo: true },
    orderBy: { codigo: 'desc' },
  });

  if (ultimoCodigo) {
    return ultimoCodigo.codigo + 1;
  }

  return 1;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    const body: RoomsProps = await req.json();
    const { titulo, senha, salaPrivada } = body;

    if (salaPrivada && !senha) {
      return NextResponse.json(
        {
          error:
            'É necessário uma senha para salas privadas',
        },
        { status: 400 },
      );
    }

    const codigo = await geradorCodigoUnico();

    let hashedSenha: string | null = null;

    if (senha) {
      const saltRounds = 12;
      hashedSenha = await bcrypt.hash(senha, saltRounds);
    }

    const novaSala = await prismaClient.sala.create({
      data: {
        titulo,
        codigo,
        senha: hashedSenha,
        criado_por: userId!,
      },
    });

    if (!novaSala) {
      return NextResponse.json(
        { error: 'Erro ao criar sala' },
        { status: 500 },
      );
    }

    return NextResponse.json(novaSala, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    return NextResponse.json(
      { error: 'Erro inesperado' },
      { status: 500 },
    );
  }
}

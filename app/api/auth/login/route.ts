import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  // chama o backend real
  const res = await fetch(
    `${process.env.BACKEND_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json(
      { error },
      { status: res.status },
    );
  }

  const data = await res.json();

  // grava JWT no cookie httpOnly
  (await cookies()).set({
    name: 'access_token',
    value: data.token,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 10 * 60 * 60,
  });

  return NextResponse.json({ success: true });
}

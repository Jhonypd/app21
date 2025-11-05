import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cabeçalhos hop-by-hop que não devem ser repassados
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

function filterResponseHeaders(headers: Headers) {
  const out = new Headers();
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

function filterRequestHeaders(headers: Headers) {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (!HOP_BY_HOP.has(lk) && lk !== 'host') {
      out[key] = value;
    }
  });
  return out;
}

async function proxyRequest(req: Request) {
  const url = new URL(req.url);
  const rawEndpoint = url.searchParams.get('endpoint') || '';

  const endpoint = rawEndpoint.trim();
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  // Reject absolute URLs and protocol-relative URLs for safety
  if (/^https?:\/\//i.test(endpoint) || endpoint.startsWith('//')) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  // ensure starts with '/'
  const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  const backendBase = process.env.BACKEND_URL;
  if (!backendBase) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }

  const token = (await cookies()).get('access_token')?.value;

  const method = req.method.toUpperCase();

  // Build headers to forward
  const forwarded = filterRequestHeaders(req.headers);
  if (token) {
    forwarded['authorization'] = `Bearer ${token}`;
  }

  // timeout usando AbortController
  const controller = new AbortController();
  const timeoutMs = 15000; // 15s
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const target = `${backendBase.replace(/\/$/, '')}${path}`;

    // ler body como texto (funciona para JSON/text). Para streams/binários complexos, adaptar.
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    }

    const backendRes = await fetch(target, {
      method,
      headers: forwarded,
      body: body && body.length > 0 ? body : undefined,
      signal: controller.signal,
      // opcional: revalidate caching behavior do Next
      next: { revalidate: 30 },
    });

    const headers = filterResponseHeaders(backendRes.headers);

    // Detectar content type
    const contentType = backendRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status, headers });
    }

    // para outros tipos, repassar como texto/stream
    const text = await backendRes.text();
    return new NextResponse(text, { status: backendRes.status, headers });
  } catch (err: unknown) {
    const e = err as { name?: string } | undefined;
    if (e?.name === 'AbortError') {
      return NextResponse.json({ error: 'Upstream request timed out' }, { status: 504 });
    }
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  return proxyRequest(req);
}

export async function POST(req: Request) {
  return proxyRequest(req);
}

export async function PUT(req: Request) {
  return proxyRequest(req);
}

export async function PATCH(req: Request) {
  return proxyRequest(req);
}

export async function DELETE(req: Request) {
  return proxyRequest(req);
}

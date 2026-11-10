import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL
    ? `${process.env.BACKEND_INTERNAL_URL.replace(/\/$/, '')}/api/v1`
    : 'http://gw-site-api:4000/api/v1';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const rawEndpoint = path.join('/');
  const endpoint = rawEndpoint.startsWith('v1/') ? rawEndpoint.replace(/^v1\//, '') : rawEndpoint;
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE}/${endpoint}${searchParams ? `?${searchParams}` : ''}`;

  const headers: Record<string, string> = {};
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body: ArrayBuffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Backend gateway request failed', error);
    return NextResponse.json({ error: 'Backend Gateway Error' }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PUT, handleProxy as PATCH, handleProxy as DELETE };

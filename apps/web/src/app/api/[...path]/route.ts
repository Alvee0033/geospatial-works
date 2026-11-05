import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = (
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io/api'
).replace(/\/+$/, '').replace(/\/v1$/, '');

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE}/${endpoint}${searchParams ? `?${searchParams}` : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const contentType = backendRes.headers.get('content-type') || 'application/json';
    const isBinary = contentType.includes('application/vnd.android.package-archive') ||
                     contentType.includes('application/octet-stream') ||
                     contentType.includes('image/') ||
                     contentType.includes('application/pdf');

    const resHeaders: Record<string, string> = {
      'Content-Type': contentType,
    };

    const contentDisposition = backendRes.headers.get('content-disposition');
    if (contentDisposition) {
      resHeaders['Content-Disposition'] = contentDisposition;
    }

    if (isBinary) {
      const buffer = await backendRes.arrayBuffer();
      return new NextResponse(buffer, {
        status: backendRes.status,
        headers: resHeaders,
      });
    }

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Backend Gateway Error', details: error.message }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PUT, handleProxy as PATCH, handleProxy as DELETE };

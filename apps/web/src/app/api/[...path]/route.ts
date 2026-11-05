import { NextRequest, NextResponse } from 'next/server';

const rawBase = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io'
).replace(/\/+$/, '');

const BACKEND_BASE = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  let endpoint = path.join('/');
  let resolvedPath = endpoint;
  if (!resolvedPath.startsWith('api/v1/')) {
    if (resolvedPath.startsWith('v1/')) {
      resolvedPath = `api/${resolvedPath}`;
    } else {
      resolvedPath = `api/v1/${resolvedPath}`;
    }
  }
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE}/${resolvedPath}${searchParams ? `?${searchParams}` : ''}`;

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
      redirect: 'manual',
    });

    if (backendRes.status === 301 || backendRes.status === 302 || backendRes.status === 307 || backendRes.status === 308) {
      const location = backendRes.headers.get('location');
      if (location) {
        return NextResponse.redirect(new URL(location, req.url), backendRes.status);
      }
    }

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

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/';

    // Revalidate paths
    if (path === 'all' || path === '*') {
      revalidatePath('/', 'layout');
    } else {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { revalidated: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/';
  if (path === 'all' || path === '*') {
    revalidatePath('/', 'layout');
  } else {
    revalidatePath(path);
  }
  return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
}


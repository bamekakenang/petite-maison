import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

function safeErrorMessage(raw: string | null, parsed: any): string {
  if (parsed && typeof parsed === 'object') {
    if (typeof parsed.error === 'string' && parsed.error) return parsed.error;
    if (typeof parsed.message === 'string' && parsed.message) return parsed.message;
  }

  if (!raw) return 'backend_error';
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) return 'backend_unavailable';
  return trimmed.slice(0, 500);
}

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      gender,
      phone,
      address,
      city,
      country,
      email,
      password,
      remember,
    } = await req.json();

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Preserve original client IP so backend rate-limit works per user (not per App Service IP)
    const xff = req.headers.get('x-forwarded-for');
    if (xff) headers['x-forwarded-for'] = xff;

    // Forward to backend API
    const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        gender,
        phone,
        address,
        city,
        country,
      }),
    });

    const raw = await backendResponse.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: safeErrorMessage(raw, data) || 'register_failed' },
        { status: backendResponse.status }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'register_failed' }, { status: 502 });
    }

    // Store tokens in httpOnly cookies
    const res = NextResponse.json({
      ok: true,
      user: data.data.user,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = isProd ? 'strict' : 'lax';

    if (data.data?.tokens) {
      res.cookies.set('auth_token', data.data.tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: 15 * 60,
      });

      res.cookies.set('refresh_token', data.data.tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: remember ? 7 * 24 * 60 * 60 : 2 * 60 * 60,
      });

      res.cookies.set('user', JSON.stringify(data.data.user), {
        httpOnly: false,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: remember ? 7 * 24 * 60 * 60 : 2 * 60 * 60,
      });
    }

    return res;
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json(
      { error: 'register_failed' },
      { status: 500 }
    );
  }
}

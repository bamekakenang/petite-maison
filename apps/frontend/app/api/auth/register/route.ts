import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function POST(req: Request) {
  try {
    const { name, email, password, remember } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Split name into firstName and lastName for backend
    const names = (name || '').trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'register_failed' },
        { status: backendResponse.status }
      );
    }

    // Store tokens in httpOnly cookies
    const res = NextResponse.json({
      ok: true,
      user: data.data.user,
    });

    if (data.data?.tokens) {
      res.cookies.set('auth_token', data.data.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });

      res.cookies.set('refresh_token', data.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: remember ? 7 * 24 * 60 * 60 : 2 * 60 * 60,
      });

      res.cookies.set('user', JSON.stringify(data.data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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

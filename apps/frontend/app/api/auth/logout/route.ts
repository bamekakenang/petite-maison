import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function POST() {
  try {
    const refreshToken = cookies().get('refresh_token')?.value;
    
    // Call backend logout if we have a refresh token
    if (refreshToken) {
      try {
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        // Ignore backend errors, still clear cookies
        console.error('Backend logout error:', e);
      }
    }

    // Clear all auth cookies
    const res = NextResponse.json({ ok: true });
    res.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
    res.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    res.cookies.set('user', '', { path: '/', maxAge: 0 });
    
    return res;
  } catch (e) {
    console.error('Logout error:', e);
    return NextResponse.json({ error: 'logout_failed' }, { status: 500 });
  }
}

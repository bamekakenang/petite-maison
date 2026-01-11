import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function safeParseItems(value: string | undefined): any[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const guest = cookieStore.get('guest_cart')?.value;
    return NextResponse.json(
      { items: safeParseItems(guest) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.debug('Cart load failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json(
      { items: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

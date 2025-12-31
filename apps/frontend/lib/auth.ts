import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function currentUser() {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return null;
    if (session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}

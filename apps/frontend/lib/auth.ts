import { cookies } from 'next/headers';

// In this app the backend sets a serialized user object in a non-HTTP-only cookie "user"
// after login/register. We read and parse it; if absent we consider the user not logged in.
export async function currentUser() {
  try {
    const raw = cookies().get('user')?.value;
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user;
  } catch {
    return null;
  }
}

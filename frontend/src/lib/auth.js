import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(redirectTo = '/login') {
    const store = await cookies();
    const token = store.get?.('token')?.value || store.get?.('token')?.value || null;
    if (!token) {
        // Redirect server-side to login when token missing
        redirect(redirectTo);
    }
    return token;
}

export async function getAuthCookies() {
    const store = await cookies();
    return {
        token: store.get?.('token')?.value || null,
        email: store.get?.('email')?.value || null,
        mobile: store.get?.('mobile')?.value || null,
    };
}

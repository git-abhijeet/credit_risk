export async function POST() {
    const headers = new Headers();
    const opts = 'Path=/; Max-Age=0; SameSite=Lax';
    // Clear cookies; mark token as HttpOnly as a best practice if it was set that way
    headers.append('Set-Cookie', `token=; HttpOnly; ${opts}`);
    headers.append('Set-Cookie', `email=; ${opts}`);
    headers.append('Set-Cookie', `mobile=; ${opts}`);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

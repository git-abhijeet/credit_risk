import getClientPromise from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, mobile, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        let client;
        try {
            client = await getClientPromise();
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        const db = client.db();
        const users = db.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        const match = await bcrypt.compare(password, user.password || '');
        if (!match) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // For now return a simple cookie-based token (placeholder). In production replace with real JWT/session handling.
        const token = `token-${String(user._id)}`;
        const headers = new Headers({ 'Content-Type': 'application/json' });
        // set basic cookies (httpOnly not set here because Response cookies API differs across runtimes)
        headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly`);
        headers.append('Set-Cookie', `email=${encodeURIComponent(user.email)}; Path=/`);
        if (user.mobile) headers.append('Set-Cookie', `mobile=${encodeURIComponent(user.mobile)}; Path=/`);
        return new Response(JSON.stringify({ ok: true, id: user._id, email: user.email }), { status: 200, headers });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
    }
}

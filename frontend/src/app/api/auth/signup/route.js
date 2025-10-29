import getClientPromise from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, mobile, password } = body;

        if (!email || !mobile || !password || (typeof name === 'undefined')) {
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

        const existing = await users.findOne({ email });
        if (existing) {
            return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);
        const now = new Date();
        const user = { name, email, mobile, password: hashed, createdAt: now };

        const res = await users.insertOne(user);
        return new Response(JSON.stringify({ ok: true, id: res.insertedId }), { status: 201 });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
    }
}

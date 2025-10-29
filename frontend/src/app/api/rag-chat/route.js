import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { message, userId, history = [] } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Missing `message`' }, { status: 400 });
        }

        const url = process.env.RAG_API_URL || 'https://zibtek.vercel.app/api/chat';
        const apiKey = process.env.RAG_API_KEY;
        const defaultUserId = process.env.RAG_DEFAULT_USER_ID || 'anonymous';

        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeout = setTimeout(() => controller?.abort(), 15000);

        let upstream;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) headers['x-api-key'] = apiKey;

            upstream = await fetch(url, {
                method: 'POST',
                headers,
                // Adjust payload shape to match upstream API; this endpoint expects { message, userId }
                body: JSON.stringify({ message, userId: userId || defaultUserId }),
                signal: controller?.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        const contentType = upstream.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
            data = await upstream.json().catch(() => ({}));
        } else {
            const text = await upstream.text().catch(() => '');
            data = text ? { reply: text } : {};
        }

        if (!upstream.ok) {
            return NextResponse.json(
                { error: data?.error || `Upstream error (${upstream.status})` },
                { status: upstream.status || 502 }
            );
        }

        // Standardize the response shape to { reply: string }
        const reply = data.reply || data.answer || data.output || data.text || data.message || '';
        return NextResponse.json({ reply }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

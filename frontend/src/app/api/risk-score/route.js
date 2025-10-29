import { NextResponse } from 'next/server';

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://localhost:8000';

export async function POST(req) {
    try {
        const body = await req.json();

        const res = await fetch(`${MODEL_SERVICE_URL}/predict`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ payload: body }),
            // reasonable timeout via AbortController
            signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json({ error: data?.detail || 'Model service error' }, { status: res.status || 502 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}

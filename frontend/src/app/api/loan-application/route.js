import getClientPromise from '../../../lib/db';

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://localhost:8000';

const AADHAAR_RE = /^\d{12}$/; // exactly 12 digits
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // e.g., ABCDE1234F

export async function POST(req) {
    try {
        const body = await req.json();
        // basic validation
        if (!body.fullName || !body.email) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Basic PAN/Aadhaar regex validation
        const pan = String(body.pan || '').toUpperCase();
        const aadhaar = String(body.aadhar || '').trim();
        if (!PAN_RE.test(pan)) {
            return new Response(JSON.stringify({ error: 'Invalid PAN format' }), { status: 400 });
        }
        if (!AADHAAR_RE.test(aadhaar)) {
            return new Response(JSON.stringify({ error: 'Invalid Aadhaar (must be 12 digits)' }), { status: 400 });
        }

        // Try to get a model decision without failing the request if model service is down
        let decision = null;
        let scoreLatencyMs = null;
        try {
            if (MODEL_SERVICE_URL) {
                const t0 = Date.now();
                const res = await fetch(`${MODEL_SERVICE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ payload: body }),
                    signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(5000) : undefined,
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    scoreLatencyMs = Date.now() - t0;
                    // Persist a compact subset to avoid huge docs
                    decision = {
                        predicted_class: data.predicted_class,
                        band: data.band,
                        probabilities: data.probabilities,
                        explanation: data.explanation,
                    };
                }
            }
        } catch (_e) {
            // Model service unavailable or timed out; continue without decision
        }

        let client;
        try {
            client = await getClientPromise();
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }

        const db = client.db();
        const applications = db.collection('loan_applications');
        const now = new Date();
        const doc = { ...body, pan, aadhar: aadhaar, ...(decision ? { decision } : {}), ...(scoreLatencyMs != null ? { scoreLatencyMs } : {}), createdAt: now };
        const res = await applications.insertOne(doc);
        // Keep response shape unchanged to avoid breaking existing clients
        return new Response(JSON.stringify({ ok: true, id: res.insertedId }), { status: 201 });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
    }
}

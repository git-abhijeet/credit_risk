import getClientPromise from '../../../../lib/db';
import { NextResponse } from 'next/server';

// Helper to compute percentiles from an array of numbers
function percentile(arr, p) {
    if (!arr?.length) return null;
    const a = [...arr].sort((x, y) => x - y);
    const idx = Math.min(a.length - 1, Math.max(0, Math.floor((p / 100) * (a.length - 1))));
    return a[idx];
}

export async function GET() {
    try {
        const client = await getClientPromise();
        const db = client.db();
        const col = db.collection('loan_applications');

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Totals
        const [todayCount, last7dCount] = await Promise.all([
            col.countDocuments({ createdAt: { $gte: startOfToday } }),
            col.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        ]);

        // Risk mix (last 7d)
        const riskAgg = await col.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: '$decision.band', c: { $sum: 1 } } },
        ]).toArray();
        const risk = { low: 0, medium: 0, high: 0, 'very-high': 0, unknown: 0 };
        for (const r of riskAgg) {
            const k = r._id || 'unknown';
            if (risk[k] === undefined) risk.unknown += r.c; else risk[k] = r.c;
        }

        // Scoring rate (last 7d)
        const [scored, totalL7] = await Promise.all([
            col.countDocuments({ createdAt: { $gte: sevenDaysAgo }, decision: { $exists: true } }),
            col.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        ]);
        const scoringRate = totalL7 ? Math.round((scored / totalL7) * 100) : 0;

        // Latency (last 7d)
        const latencyDocs = await col.find({ createdAt: { $gte: sevenDaysAgo }, scoreLatencyMs: { $type: 'number' } }, { projection: { scoreLatencyMs: 1 } }).toArray();
        const latencies = latencyDocs.map((d) => d.scoreLatencyMs).filter((n) => typeof n === 'number' && isFinite(n));
        const latency = { p50: percentile(latencies, 50), p95: percentile(latencies, 95) };

        return NextResponse.json({
            ok: true,
            totals: { today: todayCount, last7d: last7dCount },
            risk,
            scoringRate,
            latency,
            generatedAt: now.toISOString(),
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Failed to compute metrics' }, { status: 500 });
    }
}

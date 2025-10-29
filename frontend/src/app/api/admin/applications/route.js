import getClientPromise from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

        const client = await getClientPromise();
        const db = client.db();
        const applications = db.collection('loan_applications');

        const cursor = applications
            .find({}, {
                projection: {
                    fullName: 1,
                    email: 1,
                    monthlyIncome: 1,
                    loanAmount: 1,
                    createdAt: 1,
                    'decision.band': 1,
                    'decision.predicted_class': 1,
                },
            })
            .sort({ createdAt: -1 })
            .limit(limit);

        const docs = await cursor.toArray();

        return NextResponse.json({ ok: true, items: docs }, { status: 200 });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Failed to fetch applications' }, { status: 500 });
    }
}

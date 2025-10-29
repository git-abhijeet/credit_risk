import React from 'react';
import { headers } from 'next/headers';
import { requireAuth } from '../../../lib/auth';
import RiskBandChip from '../../components/RiskBandChip';

async function fetchApplications(baseUrl) {
    const res = await fetch(`${baseUrl}/api/admin/applications?limit=50`, { cache: 'no-store' });
    if (!res.ok) return { items: [] };
    return res.json();
}

export default async function ApplicationsPage() {
    await requireAuth('/login');

    // Build absolute base URL for server-side fetch
    const h = await headers();
    const proto = h.get('x-forwarded-proto') || 'http';
    const host = h.get('host') || process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${proto}://${host}`;

    const { items = [] } = await fetchApplications(baseUrl);

    return (
        <div className="mx-auto w-full max-w-6xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Recent Applications</h1>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{items.length} records</div>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white/70 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/80">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-900/40">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Applicant</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Loan</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Income</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Risk</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Class</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {items.map((doc) => (
                            <tr key={doc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                <td className="px-4 py-3 text-sm">
                                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{doc.fullName || '—'}</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{doc.email || ''}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">₹{(doc.loanAmount ?? 0).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">₹{(doc.monthlyIncome ?? 0).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-sm">
                                    {doc.decision?.band ? <RiskBandChip band={doc.decision.band} /> : <span className="text-xs text-zinc-400">Not scored</span>}
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">{doc.decision?.predicted_class || '—'}</td>
                                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                    No applications yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

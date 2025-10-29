"use client";
import React, { useEffect, useState } from 'react';

function StatCard({ title, value, subtitle }) {
    return (
        <div className="rounded-xl bg-white/70 p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/70 dark:ring-zinc-800">
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
            <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
            {subtitle && <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>}
        </div>
    );
}

function Bar({ label, pct, color }) {
    const w = Math.max(0, Math.min(100, pct || 0));
    return (
        <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                <span>{label}</span>
                <span>{w}%</span>
            </div>
            <div className="mt-1 h-2 w-full rounded bg-zinc-200/70 dark:bg-zinc-800/70">
                <div className={`h-2 rounded ${color}`} style={{ width: `${w}%` }} />
            </div>
        </div>
    );
}

export default function DashboardMetrics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    async function load() {
        try {
            const res = await fetch('/api/admin/metrics', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json.ok) throw new Error(json.error || 'Failed');
            setData(json);
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => {
        load();
        const id = setInterval(load, 10000);
        return () => clearInterval(id);
    }, []);

    if (error) {
        return (
            <div className="rounded-lg border border-yellow-300/40 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-300">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading metrics…</div>
        );
    }

    const total = data.totals?.last7d || 0;
    const risk = data.risk || {};
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Submissions Today" value={data.totals?.today ?? 0} subtitle={new Date(data.generatedAt).toLocaleString()} />
                <StatCard title="Submissions 7d" value={data.totals?.last7d ?? 0} />
                <StatCard title="Scored (7d)" value={`${data.scoringRate ?? 0}%`} subtitle="% with model decision" />
                <StatCard title="Latency (p50/p95)" value={`${data.latency?.p50 ?? '–'} / ${data.latency?.p95 ?? '–'} ms`} />
            </div>

            <div className="rounded-xl bg-white/70 p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/70 dark:ring-zinc-800">
                <div className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">Risk Mix (Last 7 days)</div>
                <Bar label="Low" pct={pct(risk.low || 0)} color="bg-green-500" />
                <Bar label="Medium" pct={pct(risk.medium || 0)} color="bg-yellow-500" />
                <Bar label="High" pct={pct(risk.high || 0)} color="bg-red-500" />
                <Bar label="Very High" pct={pct(risk['very-high'] || 0)} color="bg-red-700" />
                {risk.unknown ? <Bar label="Unknown" pct={pct(risk.unknown || 0)} color="bg-zinc-500" /> : null}
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">Auto-refreshes every 10s.</div>
        </div>
    );
}

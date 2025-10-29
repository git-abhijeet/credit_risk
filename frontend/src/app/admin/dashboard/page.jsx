import React from 'react';
import { requireAuth } from '../../../lib/auth';
import DashboardMetrics from '../../components/DashboardMetrics';

export default async function DashboardPage() {
    await requireAuth('/login');
    return (
        <div className="mx-auto w-full max-w-6xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Operations Dashboard</h1>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Overview</div>
            </div>
            <DashboardMetrics />
        </div>
    );
}

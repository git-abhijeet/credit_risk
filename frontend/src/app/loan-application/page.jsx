import React from 'react';
import LoanForm from './LoanForm.client';
import { requireAuth, getAuthCookies } from '../../lib/auth';
import LogoutButton from '../components/LogoutButton.jsx';

export default async function LoanApplicationPage() {
    // Server-side auth check; will redirect to /login if not authenticated
    await requireAuth('/login');
    const cookies = await getAuthCookies();

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-900 py-12">
            <main className="mx-auto flex min-h-[70vh] w-full flex-col items-center px-6">
                <div className="mx-auto mb-6 w-full md:w-3/4 lg:w-2/3 xl:w-7/12 2xl:w-3/5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-600 dark:text-zinc-300">
                            {cookies.email ? `Signed in as ${cookies.email}` : 'Authenticated'}
                        </div>
                        <LogoutButton />
                    </div>
                </div>
                <LoanForm prefill={{ email: cookies.email, mobile: cookies.mobile }} />
            </main>
        </div>
    );
}

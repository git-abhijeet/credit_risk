import Link from 'next/link';
import { cookies } from 'next/headers';
import LogoutButton from './LogoutButton.jsx';

export default async function NavBar() {
    const store = await cookies();
    const token = store.get?.('token')?.value || null;
    const email = store.get?.('email')?.value || null;

    return (
        <header className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">FC</span>
                    </div>
                    <div>
                        <h2 className="text-base font-semibold">FinFlow</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Credit & Recovery</p>
                    </div>
                </Link>

                <nav className="flex items-center gap-3">
                    {token ? (
                        <>
                            <span className="hidden text-sm text-zinc-600 dark:text-zinc-300 sm:inline">{email || 'Signed in'}</span>
                            <LogoutButton />
                            <Link href="/loan-application" className="hidden rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:inline">
                                Loan application
                            </Link>
                            <Link href="/admin/applications" className="hidden rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:inline">
                                Admin
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                                Log in
                            </Link>
                            <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:brightness-95">
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

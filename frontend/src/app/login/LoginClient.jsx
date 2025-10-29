"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../components/AuthForm.jsx";

export default function LoginClient() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (payload) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let data = null;
            try {
                data = await res.json();
            } catch (parseErr) {
                const text = await res.text().catch(() => null);
                data = { error: text || res.statusText };
            }

            if (!res.ok) {
                const message = data?.error || `Login failed (${res.status})`;
                setError(message);
                console.error('Login error', { status: res.status, data });
                return;
            }

            // TODO: set auth (cookie/JWT)
            // Redirect to protected loan application dashboard after login
            router.push('/loan-application');
        } catch (err) {
            console.error('Network error during login', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <AuthForm mode="login" onSubmit={handleLogin} />
            {loading && <div className="mt-2 text-sm text-zinc-500">Processing...</div>}
        </div>
    );
}

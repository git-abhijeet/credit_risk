"use client";
import { useState } from "react";

export default function AuthForm({ mode = "signup", onSubmit }) {
    const isSignup = mode === "signup";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (isSignup && !name.trim()) e.name = "Name is required";
        if (!email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
        if (isSignup) {
            if (!mobile.trim()) e.mobile = "Mobile is required";
            else if (!/^\+?[0-9]{7,15}$/.test(mobile)) e.mobile = "Invalid phone number";
        }
        if (!password) e.password = "Password is required";
        else if (password.length < 6) e.password = "Password must be at least 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            // prepare payload
            const payload = {
                email: email.trim(),
                password,
            };
            if (isSignup) {
                payload.name = name.trim();
                payload.mobile = mobile.trim();
            }

            // callback for parent or later API integration
            if (onSubmit) await onSubmit(payload);
        } catch (err) {
            // handle error UI
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto w-[92vw] max-w-3xl rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-900/80"
        >
            <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{isSignup ? "Create an account" : "Welcome back"}</h2>
            {isSignup && (
                <label className="mb-4 block">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</span>
                    <input
                        aria-label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                        placeholder="Your full name"
                    />
                    {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                </label>
            )}

            <label className="mb-4 block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
                <input
                    aria-label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                    placeholder="you@example.com"
                />
                {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
            </label>

            {isSignup && (
                <label className="mb-4 block">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mobile</span>
                    <input
                        aria-label="Mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                        placeholder="+1234567890"
                    />
                    {errors.mobile && <div className="mt-1 text-sm text-red-600">{errors.mobile}</div>}
                </label>
            )}

            <label className="mb-6 block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
                <input
                    aria-label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                    placeholder="Enter password"
                />
                {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
            </label>

            <div className="space-y-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60"
                >
                    {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
                </button>
                <div className="text-center">
                    <a href={isSignup ? "/login" : "/signup"} className="text-sm text-zinc-600 hover:underline dark:text-zinc-300">
                        {isSignup ? "Already have an account? Log in" : "New here? Create account"}
                    </a>
                </div>
            </div>
        </form>
    );
}

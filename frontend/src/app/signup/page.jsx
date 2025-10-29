import SignupClient from "./SignupClient";
import React from "react";

export default function SignupPage() {
    return (
        <div className="bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-900">
            <main className="mx-auto flex min-h-screen w-full items-center justify-center px-6">
                <SignupClient />
            </main>
        </div>
    );
}

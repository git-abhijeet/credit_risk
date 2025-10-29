"use client";
import React, { useState } from 'react';

export default function LoanForm({ prefill = {} }) {
    const [fullName, setFullName] = useState(prefill.name || '');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [mobile, setMobile] = useState(prefill.mobile || '');
    const [email, setEmail] = useState(prefill.email || '');
    const [pan, setPan] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [employmentType, setEmploymentType] = useState('Salaried');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [loanPurpose, setLoanPurpose] = useState('');
    const [existingLoans, setExistingLoans] = useState('No');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [decision, setDecision] = useState(null);
    const [scoringError, setScoringError] = useState(null);
    const [affordability, setAffordability] = useState(null);
    const [tenureMonths, setTenureMonths] = useState(24); // UI-only, for affordability
    const [annualRate, setAnnualRate] = useState(18); // % APR, UI-only

    // Simple regex validators
    const AADHAAR_RE = /^\d{12}$/; // exactly 12 digits
    const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // e.g., ABCDE1234F

    // Simple affordability helper: approximate EMI burden as loanAmount/12 vs income
    function computeAffordability(income, amount, months, apr) {
        const inc = Number(income) || 0;
        const amt = Number(amount) || 0;
        const n = Number(months) || 0;
        const r = (Number(apr) || 0) / 100 / 12; // monthly interest rate
        if (!inc || !amt || !n) return null;

        // Standard EMI formula:
        // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        // Fallback to simple division if r == 0
        let emi = 0;
        if (r > 0) {
            const pow = Math.pow(1 + r, n);
            const denom = pow - 1;
            emi = denom !== 0 ? amt * r * pow / denom : amt / n;
        } else {
            emi = amt / n;
        }
        const ratio = emi / inc; // portion of income to cover EMI
        let category = 'Unknown';
        if (ratio <= 0.2) category = 'Excellent';
        else if (ratio <= 0.35) category = 'Good';
        else if (ratio <= 0.5) category = 'Stretched';
        else category = 'Critical';
        return { ratio, category, emi, months: n, rate: Number(apr) || 0 };
    }

    const validate = () => {
        const e = {};
        if (!fullName.trim()) e.fullName = 'Full Name is required';
        if (!age || Number(age) <= 0) e.age = 'Valid age is required';
        if (!gender) e.gender = 'Gender is required';
        if (!mobile.trim()) e.mobile = 'Mobile is required';
        if (!email.trim()) e.email = 'Email is required';
        const panUpper = pan.trim().toUpperCase();
        if (!panUpper) e.pan = 'PAN is required';
        else if (!PAN_RE.test(panUpper)) e.pan = 'Invalid PAN format (e.g., ABCDE1234F)';

        const aad = aadhar.trim();
        if (!aad) e.aadhar = 'Aadhaar is required';
        else if (!AADHAAR_RE.test(aad)) e.aadhar = 'Aadhaar must be exactly 12 digits';
        if (!monthlyIncome || Number(monthlyIncome) < 0) e.monthlyIncome = 'Monthly income is required';
        if (!loanAmount || Number(loanAmount) <= 0) e.loanAmount = 'Loan amount required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setSuccess(null);
        setDecision(null);
        setScoringError(null);
        setAffordability(null);
        try {
            const payload = {
                fullName,
                age: Number(age),
                gender,
                mobile,
                email,
                pan: pan.toUpperCase(),
                aadhar: aadhar,
                employmentType,
                monthlyIncome: Number(monthlyIncome),
                loanAmount: Number(loanAmount),
                loanPurpose,
                existingLoans: existingLoans === 'Yes',
            };

            const res = await fetch('/api/loan-application', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Submission failed' }));
                setErrors({ submit: err.error || 'Submission failed' });
                return;
            }

            setSuccess('Application submitted successfully');

            // Compute affordability indicator locally for the displayed application
            const aff = computeAffordability(monthlyIncome, loanAmount, tenureMonths, annualRate);
            if (aff) setAffordability(aff);

            // Fetch model decision to show in UI without relying on submission response
            try {
                const scoreRes = await fetch('/api/risk-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const scoreData = await scoreRes.json().catch(() => ({}));
                if (scoreRes.ok) {
                    setDecision({
                        predicted_class: scoreData.predicted_class,
                        band: scoreData.band,
                        probabilities: scoreData.probabilities,
                        explanation: scoreData.explanation,
                    });
                } else {
                    setScoringError(scoreData?.error || 'Could not retrieve risk score');
                }
            } catch (_e) {
                setScoringError('Could not retrieve risk score');
            }
        } catch (err) {
            setErrors({ submit: 'Network error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto w-full md:w-3/4 lg:w-2/3 xl:w-7/12 2xl:w-3/5 rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-900/80"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Loan Application
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Provide your details to help us assess your eligibility.
                </p>
            </div>

            {/* Personal Details */}
            <div className="mb-6 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                    Personal Details
                </h3>

                <label className="mb-4 block">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Priya Sharma"
                    />
                    {errors.fullName && <div className="mt-1 text-sm text-red-500">{errors.fullName}</div>}
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Age</span>
                        <input
                            type="number"
                            min={18}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g., 28"
                        />
                        {errors.age && <div className="mt-1 text-sm text-red-500">{errors.age}</div>}
                    </label>

                    <div className="mb-1">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gender</span>
                        <div className="mt-2 inline-flex w-full overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <button
                                    type="button"
                                    key={g}
                                    onClick={() => setGender(g)}
                                    className={
                                        `flex-1 px-3 py-2 text-sm transition focus:outline-none ` +
                                        (gender === g
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800/70 dark:text-zinc-200 hover:dark:bg-zinc-800')
                                    }
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                        {errors.gender && <div className="mt-1 text-sm text-red-500">{errors.gender}</div>}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mobile Number</span>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 98765 43210"
                        />
                        {errors.mobile && <div className="mt-1 text-sm text-red-500">{errors.mobile}</div>}
                    </label>

                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
                        <input
                            type="email"
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                    </label>
                </div>

                {/* Repayment assumptions for affordability (UI-only) */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tenure (months)</span>
                        <input
                            type="number"
                            min={1}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={tenureMonths}
                            onChange={(e) => setTenureMonths(e.target.value)}
                            placeholder="e.g., 24"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Used only for affordability display; not sent for scoring.</p>
                    </label>
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Annual Interest Rate (%)</span>
                        <input
                            type="number"
                            min={0}
                            step={0.1}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={annualRate}
                            onChange={(e) => setAnnualRate(e.target.value)}
                            placeholder="e.g., 18"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Used only for affordability display; not sent for scoring.</p>
                    </label>
                </div>
            </div>

            {/* Identity */}
            <div className="mb-6 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">Identity</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">PAN Number</span>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={pan}
                            onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                            maxLength={10}
                            placeholder="ABCDE1234F"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Format: ABCDE1234F (5 letters, 4 digits, 1 letter). Auto‑uppercased.</p>
                        {errors.pan && <div className="mt-1 text-sm text-red-500">{errors.pan}</div>}
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">As per your PAN card</p>
                    </label>
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aadhar Number</span>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                            value={aadhar}
                            onChange={(e) => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            inputMode="numeric"
                            maxLength={12}
                            placeholder="12-digit number"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Must be exactly 12 digits. Numbers only.</p>
                        {errors.aadhar && <div className="mt-1 text-sm text-red-500">{errors.aadhar}</div>}
                    </label>
                </div>
            </div>

            {/* Employment & Loan */}
            <div className="mb-6 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                    Employment & Loan
                </h3>
                <label className="mb-4 block">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Employment Type</span>
                    <select
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                    >
                        <option>Salaried</option>
                        <option>Self-employed</option>
                        <option>Student</option>
                        <option>Other</option>
                    </select>
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly Income</span>
                        <div className="mt-1 flex items-center rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100">
                            <span className="mr-2 select-none text-zinc-500 dark:text-zinc-400">₹</span>
                            <input
                                type="number"
                                min={0}
                                className="w-full bg-transparent py-2 outline-none"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                placeholder="e.g., 65000"
                            />
                        </div>
                        {errors.monthlyIncome && <div className="mt-1 text-sm text-red-500">{errors.monthlyIncome}</div>}
                    </label>
                    <label className="mb-1 block">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Loan Amount Required</span>
                        <div className="mt-1 flex items-center rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100">
                            <span className="mr-2 select-none text-zinc-500 dark:text-zinc-400">₹</span>
                            <input
                                type="number"
                                min={0}
                                className="w-full bg-transparent py-2 outline-none"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                placeholder="e.g., 500000"
                            />
                        </div>
                        {errors.loanAmount && <div className="mt-1 text-sm text-red-500">{errors.loanAmount}</div>}
                    </label>
                </div>

                <label className="mt-4 block">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Loan Purpose</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
                        value={loanPurpose}
                        onChange={(e) => setLoanPurpose(e.target.value)}
                        placeholder="e.g., Home renovation, Education, Medical, Business"
                    />
                </label>

                <div className="mt-4">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Existing Loans</span>
                    <div className="mt-2 inline-flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                        {['No', 'Yes'].map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setExistingLoans(opt)}
                                className={
                                    `px-4 py-2 text-sm transition focus:outline-none ` +
                                    (existingLoans === opt
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800/70 dark:text-zinc-200 hover:dark:bg-zinc-800')
                                }
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {errors.submit && (
                <div className="mb-4 rounded-lg border border-red-300/40 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                    {errors.submit}
                </div>
            )}
            {success && (
                <div className="mb-4 rounded-lg border border-green-300/40 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300">
                    {success}
                </div>
            )}

            {/* Scoring result (optional, shown after submit) */}
            {decision && (
                <div className="mb-6 rounded-xl border border-indigo-200/60 bg-indigo-50/50 p-4 text-sm dark:border-indigo-900/30 dark:bg-indigo-900/10">
                    <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-indigo-900 dark:text-indigo-200">Risk Assessment</h4>
                        <span
                            className={
                                'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                (decision.band === 'low'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : decision.band === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300')
                            }
                        >
                            {decision.band?.toUpperCase()} RISK
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Predicted Class</div>
                            <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">{decision.predicted_class}</div>
                        </div>
                        <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Top Probability</div>
                            <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                                {(() => {
                                    const probs = decision.probabilities || {};
                                    const entries = Object.entries(probs);
                                    if (!entries.length) return '—';
                                    const [label, p] = entries.sort((a, b) => b[1] - a[1])[0];
                                    return `${label}: ${(p * 100).toFixed(1)}%`;
                                })()}
                            </div>
                        </div>
                        <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Explanations</div>
                            <ul className="mt-1 list-disc pl-5 text-zinc-800 dark:text-zinc-200">
                                {(decision.explanation || []).slice(0, 3).map((e, i) => (
                                    <li key={i} className="text-xs">{e}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {affordability && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Affordability</div>
                                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                                    {affordability.category}
                                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        EMI/Income {(affordability.ratio * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Estimated EMI</div>
                                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">₹{(affordability.emi || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-800">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Assumptions</div>
                                <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">{affordability.months} mo @ {affordability.rate}% APR</div>
                            </div>
                        </div>
                    )}
                    <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Note: This is an automated preliminary assessment and may be refined during verification.</p>
                </div>
            )}

            {scoringError && (
                <div className="mb-6 rounded-lg border border-yellow-300/40 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-300">
                    {scoringError}
                </div>
            )}

            <div className="flex items-center justify-between">
                <button
                    disabled={submitting}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60"
                >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    );
}

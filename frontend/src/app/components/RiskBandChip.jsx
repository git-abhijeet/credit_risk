"use client";
import React from 'react';

export default function RiskBandChip({ band }) {
    const b = (band || '').toLowerCase();
    const cls =
        b === 'low'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : b === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
            {(band || 'unknown').toUpperCase()} RISK
        </span>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, ReferenceLine, PolarAngleAxis } from "recharts";
import { Target, AlertTriangle, CheckCircle, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";

interface Budget {
    Id: number;
    name: string;
    budget: number;
    spent: number;
    percentage: number;
    remaining: number;
}

interface Props {
    budgets: Budget[];
    historicalData: { month: string; totalBudget: number; totalSpent: number }[];
    totalBudget: number;
    currentSpent: number;
    overBudgetCount: number;
    onTrackCount: number;
}

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{label}</p>
            {payload.map((e: any, i: number) => (
                <p key={i} className="text-sm font-semibold" style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>
            ))}
        </div>
    );
};

export default function BudgetsClient({ budgets, historicalData, totalBudget, currentSpent, overBudgetCount, onTrackCount }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const overallPercentage = totalBudget > 0 ? Math.round((currentSpent / totalBudget) * 100) : 0;
    const isOverall = overallPercentage > 100;
    const gaugeColor = isOverall ? "#ef4444" : overallPercentage > 80 ? "#f59e0b" : "#10b981";

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Budgets</h1>
                <p className="text-[var(--foreground-muted)] mt-1">Track your spending against budget limits</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10">
                        <Wallet className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Total Budget</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(totalBudget)}</p>
                    </div>
                </div>
                <div className="glass-card p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10">
                        <TrendingUp className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Spent</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(currentSpent)}</p>
                    </div>
                </div>
                <div className="glass-card p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--foreground-muted)]">On Track</p>
                        <p className="text-2xl font-bold text-emerald-400">{onTrackCount} categories</p>
                    </div>
                </div>
                <div className="glass-card p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--foreground-muted)]">Over Budget</p>
                        <p className="text-2xl font-bold text-red-400">{overBudgetCount} categories</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Budget Gauge - Premium Redesign */}
                <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 self-start">Overall Budget</h3>
                    <p className="text-xs text-[var(--foreground-muted)] mb-4 self-start">Total spending power</p>

                    <div className="flex flex-col items-center justify-center w-full">
                        {/* Large Gauge Container */}
                        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                            <svg width="0" height="0" className="absolute">
                                <defs>
                                    <linearGradient id="gaugeGradientBudgetsV2" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={gaugeColor} stopOpacity={0.6} />
                                        <stop offset="100%" stopColor={gaugeColor} stopOpacity={1} />
                                    </linearGradient>
                                    <filter id="glowBudgetsV2" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                            </svg>

                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="65%"
                                        outerRadius="82%"
                                        barSize={16}
                                        data={[{ value: Math.min(overallPercentage, 100), fill: "url(#gaugeGradientBudgetsV2)" }]}
                                        startAngle={200}
                                        endAngle={-20}
                                    >
                                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                        <RadialBar
                                            background={{ fill: 'rgba(255,255,255,0.04)' }}
                                            dataKey="value"
                                            cornerRadius={15}
                                            style={{ filter: 'url(#glowBudgetsV2)' }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            )}

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                <span className="text-6xl font-black tracking-tighter leading-none text-center" style={{ color: gaugeColor, textShadow: `0 0 40px ${gaugeColor}66` }}>
                                    {overallPercentage}
                                    <span className="text-2xl font-bold opacity-70 ml-1">%</span>
                                </span>
                                <span className="text-xs font-bold text-white/60 uppercase tracking-[0.3em] mt-1 mb-6">
                                    Used
                                </span>

                                {/* Integrated Stats - positioned in the arc opening */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-center w-full max-w-[240px]">
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-wider mb-0.5">Spent</p>
                                        <p className="text-sm font-bold text-red-400">{formatCurrency(currentSpent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-wider mb-0.5">Remaining</p>
                                        <p className={`text-sm font-bold ${totalBudget - currentSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatCurrency(totalBudget - currentSpent)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Stat */}
                        <div className="w-full mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                            <span className="text-[var(--foreground-muted)]">Total Budget Limit</span>
                            <span className="font-bold text-[var(--foreground)]">{formatCurrency(totalBudget)}</span>
                        </div>
                    </div>
                </div>

                {/* Historical Performance - Premium Redesign */}
                <div className="lg:col-span-2 glass-card p-6 pb-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Budget vs Actual</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">Last 6 months performance</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-red-500 to-red-500/30" />
                                <span className="text-[var(--foreground-muted)]">Spent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-0.5 bg-indigo-500 opacity-60" style={{ borderStyle: 'dashed' }} />
                                <span className="text-[var(--foreground-muted)]">Budget Limit</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[240px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historicalData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="barGradientV2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f87171" stopOpacity={0.95} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                                        </linearGradient>
                                        <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b6b80', fontSize: 11 }}
                                        dy={5}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b6b80', fontSize: 10 }}
                                        tickFormatter={v => {
                                            if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                                            return v.toString();
                                        }}
                                        width={45}
                                    />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
                                    />
                                    <ReferenceLine
                                        y={totalBudget}
                                        stroke="#6366f1"
                                        strokeDasharray="6 4"
                                        strokeWidth={1.5}
                                        strokeOpacity={0.6}
                                    />
                                    <Bar
                                        dataKey="totalSpent"
                                        name="Spent"
                                        fill="url(#barGradientV2)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={36}
                                        style={{ filter: 'url(#barGlow)' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Budgets */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Budget by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.filter(b => b.budget > 0).map(b => {
                        const over = b.percentage > 100;
                        const warn = b.percentage > 80;
                        const color = over ? "bg-red-500" : warn ? "bg-amber-500" : "bg-emerald-500";
                        const textColor = over ? "text-red-400" : warn ? "text-amber-400" : "text-emerald-400";

                        return (
                            <div key={b.Id} className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--glass-border)]">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-[var(--foreground)]">{b.name}</p>
                                    <span className={`text-sm font-bold ${textColor}`}>{b.percentage}%</span>
                                </div>
                                <div className="progress-bar mb-2">
                                    <div className={`progress-bar-fill ${color}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                                    <span>{formatCompactCurrency(b.spent)} spent</span>
                                    <span>{formatCompactCurrency(b.budget)} budget</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

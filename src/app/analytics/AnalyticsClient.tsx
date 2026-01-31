"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Clock, Calendar, Activity, Zap, DollarSign } from "lucide-react";
import { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/utils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#14b8a6", "#f97316"];

interface Props {
    monthlyData: { month: string; income: number; expenses: number; net: number }[];
    categoryTrends: { name: string; current: number; previous: number; change: number }[];
    weekdayPattern: { day: string; amount: number; count: number }[];
    hourlyPattern: { hour: number; amount: number; count: number }[];
    topCategories: { name: string; total: number; count: number }[];
    totalTransactions: number;
    avgTransaction: number;
    maxExpense: number;
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

export default function AnalyticsClient({ monthlyData, categoryTrends, weekdayPattern, hourlyPattern, topCategories, totalTransactions, avgTransaction, maxExpense }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const totalSpent = topCategories.reduce((sum, c) => sum + c.total, 0);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Analytics</h1>
                <p className="text-[var(--foreground-muted)] mt-1">Deep dive into your spending patterns and trends</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10"><Activity className="w-5 h-5 text-indigo-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">Total Transactions</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{formatNumber(totalTransactions)}</p>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">Average Transaction</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{formatCurrency(avgTransaction)}</p>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-red-500/10"><Zap className="w-5 h-5 text-red-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">Largest Expense</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{formatCurrency(maxExpense)}</p>
                </div>
            </div>

            {/* 12-Month Trend */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">12-Month Cash Flow</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">Income vs Expenses over time</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /> Income</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" /> Expenses</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-1 rounded bg-indigo-500" /> Net</span>
                    </div>
                </div>
                <div className="h-[300px]">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 11 }} tickFormatter={v => formatCompactCurrency(v)} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="net" name="Net" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Category Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Categories */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Top Spending Categories</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative w-48 h-48 flex-shrink-0">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={topCategories} cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={2} dataKey="total" stroke="none">
                                            {topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-[var(--foreground)] leading-tight">{formatCompactCurrency(totalSpent)}</span>
                                <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-tight">Total</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 max-h-44 overflow-y-auto">
                            {topCategories.map((cat, i) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-sm text-[var(--foreground-muted)]">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--foreground)]">{formatCompactCurrency(cat.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Month-over-Month */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Category Trends (vs Last Month)</h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                        {categoryTrends.map(c => (
                            <div key={c.name} className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{c.name}</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">{formatCompactCurrency(c.current)} this month</p>
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${c.change > 0 ? 'text-red-400' : c.change < 0 ? 'text-emerald-400' : 'text-[var(--foreground-muted)]'}`}>
                                    {c.change > 0 ? <TrendingUp className="w-4 h-4" /> : c.change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                                    {c.change > 0 ? '+' : ''}{c.change}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekday Pattern */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Spending by Day of Week</h3>
                    </div>
                    <div className="h-[200px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekdayPattern} layout="vertical">
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 10 }} tickFormatter={v => formatCompactCurrency(v)} />
                                    <YAxis type="category" dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 11 }} width={40} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Hourly Pattern */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Spending by Hour</h3>
                    </div>
                    <div className="h-[200px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyPattern}>
                                    <defs>
                                        <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 10 }} tickFormatter={h => `${h}h`} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 10 }} tickFormatter={v => formatCompactCurrency(v)} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fill="url(#hourGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

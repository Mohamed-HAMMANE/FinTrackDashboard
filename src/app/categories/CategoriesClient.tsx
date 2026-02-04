"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line
} from "recharts";
import { BarChart3, Calendar, Receipt, TrendingUp, Zap } from "lucide-react";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/utils";

interface CategoryRow {
    Id: number;
    Name: string;
    Budget: number;
}

interface CategoryData {
    id: number;
    name: string;
    budget: number;
    mtdIncome: number;
    mtdExpense: number;
    mtdIncomeCount: number;
    mtdExpenseCount: number;
    totalIncome: number;
    totalExpense: number;
    totalIncomeCount: number;
    totalExpenseCount: number;
    avgIncomeTxn: number;
    avgExpenseTxn: number;
    maxIncomeTxn: number;
    maxExpenseTxn: number;
    avgIncomePerMonth: number;
    avgExpensePerMonth: number;
    avgNetPerMonth: number;
    activeMonths: number;
    monthlySeries: { key: string; month: string; income: number; expense: number; net: number }[];
    dailySeries: { date: string; income: number; expense: number; net: number }[];
    topIncomeNotes: { comment: string; total: number; count: number; months: number }[];
    topExpenseNotes: { comment: string; total: number; count: number; months: number }[];
}

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="text-xs text-[var(--foreground-muted)] mb-1">{label}</p>
            {payload.map((e: any, i: number) => (
                <p key={i} className="text-sm font-semibold" style={{ color: e.color }}>
                    {e.name}: {formatCurrency(e.value)}
                </p>
            ))}
        </div>
    );
};

export default function CategoriesClient({
    categories,
    data
}: {
    categories: CategoryRow[];
    data: CategoryData[];
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedId, setSelectedId] = useState<number>(categories[0]?.Id ?? 0);

    useEffect(() => setIsMounted(true), []);

    const selected = useMemo(() => data.find(d => d.id === selectedId) || data[0], [data, selectedId]);

    if (!selected) {
        return (
            <div className="p-6 lg:p-8">
                <div className="glass-card p-6">No categories found.</div>
            </div>
        );
    }

    const budgetBase = Math.abs(selected.budget);
    const budgetPct = budgetBase > 0 ? Math.round((selected.mtdExpense / budgetBase) * 100) : 0;
    const remaining = budgetBase - selected.mtdExpense;
    const hasIncome = selected.totalIncome > 0;
    const hasExpense = selected.totalExpense > 0;
    const median = (values: number[]) => {
        const v = values.filter(n => n > 0).sort((a, b) => a - b);
        if (v.length === 0) return 0;
        const mid = Math.floor(v.length / 2);
        return v.length % 2 === 0 ? (v[mid - 1] + v[mid]) / 2 : v[mid];
    };
    const expectedIncome = median(selected.monthlySeries.map(m => m.income));
    const expectedExpense = median(selected.monthlySeries.map(m => m.expense));
    const incomeExpectedSeries = selected.monthlySeries.map(m => ({
        month: m.month,
        actual: m.income,
        expected: expectedIncome
    }));
    const expenseExpectedSeries = selected.monthlySeries.map(m => ({
        month: m.month,
        actual: m.expense,
        expected: expectedExpense
    }));
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Category Intel</h1>
                    <p className="text-[var(--foreground-muted)] mt-1">Pick a category and see deep performance insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Category</span>
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(Number(e.target.value))}
                        className="input w-full sm:w-[220px] lg:w-[200px] h-10"
                    >
                        {categories.map(c => (
                            <option key={c.Id} value={c.Id}>{c.Name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Key Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10"><Calendar className="w-5 h-5 text-emerald-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">All-Time Avg / Month</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Income</span>
                            <span className="font-bold text-emerald-400">{formatCurrency(selected.avgIncomePerMonth)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Expense</span>
                            <span className="font-bold text-red-400">{formatCurrency(selected.avgExpensePerMonth)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Net</span>
                            <span className={`font-bold ${selected.avgNetPerMonth >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                {formatCurrency(selected.avgNetPerMonth)}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-2">
                        Based on {selected.activeMonths} active months
                    </p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10"><TrendingUp className="w-5 h-5 text-indigo-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">MTD Activity</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Income</span>
                            <span className="font-bold text-emerald-400">{formatCurrency(selected.mtdIncome)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Expense</span>
                            <span className="font-bold text-red-400">{formatCurrency(selected.mtdExpense)}</span>
                        </div>
                    </div>
                    {budgetBase > 0 ? (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-[var(--foreground-muted)] mb-1">
                                <span>Budget</span>
                                <span>{budgetPct}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className={`progress-bar-fill ${budgetPct > 100 ? "bg-red-500" : budgetPct > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, budgetPct)}%` }} />
                            </div>
                            <p className="text-[10px] text-[var(--foreground-muted)] mt-1">
                                Remaining: <span className={remaining >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(remaining)}</span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-2">No budget set</p>
                    )}
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10"><Zap className="w-5 h-5 text-amber-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">Avg Transaction</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Income</span>
                            <span className="font-bold text-emerald-400">{formatCurrency(selected.avgIncomeTxn)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">Expense</span>
                            <span className="font-bold text-red-400">{formatCurrency(selected.avgExpenseTxn)}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-2">
                        Max: <span className="text-emerald-300">{formatCompactCurrency(selected.maxIncomeTxn)}</span> / <span className="text-red-300">{formatCompactCurrency(selected.maxExpenseTxn)}</span>
                    </p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10"><Receipt className="w-5 h-5 text-cyan-400" /></div>
                        <span className="text-sm text-[var(--foreground-muted)]">Transactions</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{formatNumber(selected.totalIncomeCount + selected.totalExpenseCount)}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">
                        {formatNumber(selected.mtdIncomeCount + selected.mtdExpenseCount)} this month
                    </p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">
                        Income {formatNumber(selected.totalIncomeCount)} · Expense {formatNumber(selected.totalExpenseCount)}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Last 36 Months</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">Monthly spend trend</p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </div>
                    <div className="h-[240px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={selected.monthlySeries}>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 9 }} interval={2} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v)} />
                                    <Tooltip content={<ChartTooltip />} />
                                    {hasIncome && <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />}
                                    {hasExpense && <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {(hasIncome || hasExpense) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {hasIncome && expectedIncome > 0 && (
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Expected vs Actual (Income)</h3>
                                    <p className="text-sm text-[var(--foreground-muted)]">Median baseline</p>
                                </div>
                            </div>
                            <div className="h-[220px]">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={incomeExpectedSeries}>
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 9 }} interval={2} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v)} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                                            <Line type="monotone" dataKey="expected" name="Expected" stroke="#a7f3d0" strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    )}
                    {hasExpense && expectedExpense > 0 && (
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Expected vs Actual (Expense)</h3>
                                    <p className="text-sm text-[var(--foreground-muted)]">Median baseline</p>
                                </div>
                            </div>
                            <div className="h-[220px]">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={expenseExpectedSeries}>
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 9 }} interval={2} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v)} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="actual" name="Actual" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                                            <Line type="monotone" dataKey="expected" name="Expected" stroke="#fecaca" strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Top Descriptions (Income)</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">Recurring notes</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {selected.topIncomeNotes.length === 0 && (
                            <div className="text-xs text-[var(--foreground-muted)]">No income notes</div>
                        )}
                        {selected.topIncomeNotes.map(n => (
                            <div key={`inc-${n.comment}`} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--foreground-muted)] truncate">{n.comment}</span>
                                <span className="font-semibold text-emerald-400">{formatCompactCurrency(n.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Top Descriptions (Expense)</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">Recurring notes</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {selected.topExpenseNotes.length === 0 && (
                            <div className="text-xs text-[var(--foreground-muted)]">No expense notes</div>
                        )}
                        {selected.topExpenseNotes.map(n => (
                            <div key={`exp-${n.comment}`} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--foreground-muted)] truncate">{n.comment}</span>
                                <span className="font-semibold text-red-400">{formatCompactCurrency(n.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Last 30 Days</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">Daily spend trend</p>
                    </div>
                    <BarChart3 className="w-4 h-4 text-[var(--foreground-muted)]" />
                </div>
                <div className="h-[240px]">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selected.dailySeries}>
                                <defs>
                                    <linearGradient id="catDailyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 10 }} minTickGap={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b6b80", fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v)} />
                                <Tooltip content={<ChartTooltip />} />
                                {hasIncome && (
                                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="none" />
                                )}
                                {hasExpense && (
                                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="none" />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}


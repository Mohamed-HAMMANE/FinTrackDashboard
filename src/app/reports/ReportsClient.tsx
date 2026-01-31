"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { FileText, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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

function SummaryCard({ title, period, income, expenses, transactions }: {
    title: string; period: string; income: number; expenses: number; transactions: number;
}) {
    const net = income - expenses;
    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10">
                    <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">{period}</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Income
                    </span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(income)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                        <TrendingDown className="w-4 h-4 text-red-400" /> Expenses
                    </span>
                    <span className="font-semibold text-red-400">{formatCurrency(expenses)}</span>
                </div>
                <div className="h-px bg-[var(--glass-border)]" />
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                        <DollarSign className="w-4 h-4 text-indigo-400" /> Net
                    </span>
                    <span className={`font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(net)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                        <Activity className="w-4 h-4 text-purple-400" /> Transactions
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{transactions}</span>
                </div>
            </div>
        </div>
    );
}

export default function ReportsClient({
    monthlyIncome, monthlyExpenses, monthlyTransactions,
    yearlyIncome, yearlyExpenses, yearlyTransactions,
    allTimeIncome, allTimeExpenses, allTimeTransactions,
    monthlyBreakdown, topCategoriesYear, biggestExpenses,
    currentMonth, currentYear
}: any) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Reports</h1>
                <p className="text-[var(--foreground-muted)] mt-1">Financial summaries and insights</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Monthly Report" period={currentMonth} income={monthlyIncome} expenses={monthlyExpenses} transactions={monthlyTransactions} />
                <SummaryCard title="Yearly Report" period={currentYear} income={yearlyIncome} expenses={yearlyExpenses} transactions={yearlyTransactions} />
                <SummaryCard title="All-Time" period="Since tracking" income={allTimeIncome} expenses={allTimeExpenses} transactions={allTimeTransactions} />
            </div>

            {/* Yearly Chart */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">{currentYear} Monthly Breakdown</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">Income, Expenses & Net by month</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /> Income</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" /> Expenses</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-1 rounded bg-indigo-500" /> Net</span>
                    </div>
                </div>
                <div className="h-[320px] w-full">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyBreakdown}>
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

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Categories this Year */}
                <div className="glass-card p-6 flex flex-col h-[380px]">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Top Categories ({currentYear})</h3>
                    <div className="flex-1 flex items-center">
                        <div className="flex items-center gap-6 w-full">
                            <div className="relative w-40 h-40 flex-shrink-0">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={topCategoriesYear} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="total" stroke="none">
                                                {topCategoriesYear.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-base font-bold text-[var(--foreground)] leading-tight">{formatCompactCurrency(yearlyExpenses)}</span>
                                    <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-tight">Total</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                {topCategoriesYear.map((c: any, i: number) => (
                                    <div key={c.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-sm text-[var(--foreground-muted)]">{c.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">{formatCompactCurrency(c.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biggest Expenses */}
                <div className="glass-card p-6 flex flex-col h-[380px]">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Biggest Expenses ({currentYear})</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {biggestExpenses.slice(0, 8).map((e: any, i: number) => (
                            <div key={e.Id} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-red-400">#{i + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{e.Comment || e.CategoryName}</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">{new Date(e.Date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className="text-sm font-bold text-red-400">{formatCurrency(Math.abs(e.Amount))}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

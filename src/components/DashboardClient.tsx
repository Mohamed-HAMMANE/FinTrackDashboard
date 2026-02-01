"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis,
    ComposedChart, Line, LineChart
} from "recharts";
import {
    CreditCard, ArrowUpRight, ArrowDownRight, Activity,
    PiggyBank, Calendar, TrendingUp, DollarSign, Zap,
    AlertTriangle, ChevronRight, RefreshCw, Smartphone
} from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import Link from "next/link";

// Types
interface DashboardData {
    totalBalance: number;
    monthlySpending: number;
    monthlyIncome: number;
    monthlyBudget: number;
    lastMonthSpending: number;
    spendingChange: number;
    dailyAverage: number;
    savingsRate: number;
    avgTransactionSize: number;
    transactionsThisMonth: number;
    daysWithSpending: number;
    projectedMonthlySpend: number;
    remainingBudget: number;
    largestExpense: number;
    totalIncome: number;
    totalExpenses: number;
    recentExpenses: any[];
    topExpenses: any[];
    spendingByCategory: { name: string; value: number }[];
    categoryBudgets: { name: string; budget: number; spent: number; percentage: number }[];
    spendingTrend: { date: string; amount: number }[];
    monthlyOverview: { month: string; income: number; expenses: number; net: number }[];
    weekdayPattern: { day: string; amount: number; count: number }[];
    categoryTrends: { name: string; current: number; previous: number; change: number }[];
    runningBalance: { date: string; balance: number }[];
    hourlyPattern: { hour: number; amount: number; count: number }[];
    transactionCount: number;
    categoryCount: number;
    firstTransactionDate: string;
    daysSinceFirstTransaction: number;
    lastUpdated: string;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

// Metric Counter Component
function MetricCounter({ value, duration = 1000, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);

    // Assuming formatCurrency is the desired formatter for numbers in MetricCounter
    // If a generic formatNumber is needed, it should be imported or defined.
    return (
        <span>
            {prefix}{formatCurrency(count)}{suffix}
        </span>
    );
}

// Stat Card
function StatCard({ label, value, icon: Icon, color, trend, trendValue, sparkData, isMounted, animateValue }: {
    label: string; value: string | number; icon: React.ElementType; color: string;
    trend?: "up" | "down"; trendValue?: string; sparkData?: number[]; isMounted: boolean; animateValue?: boolean;
}) {
    const colorStyles: Record<string, { bg: string; text: string; glow: string }> = {
        indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]" },
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]" },
        amber: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]" },
        red: { bg: "bg-red-500/10", text: "text-red-400", glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]" },
        purple: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]" },
        cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]" },
        blue: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]" },
    };
    const style = colorStyles[color] || colorStyles.indigo;

    return (
        <div className={`glass-card p-4 group transition-all ${style.glow}`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl ${style.bg}`}>
                    <Icon className={`w-5 h-5 ${style.text}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                        {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-0.5">
                {animateValue && typeof value === 'number' ? <MetricCounter value={value} /> : value}
            </p>
            <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">{label}</p>
        </div>
    );
}

// Custom Tooltip
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

export default function DashboardClient({ data }: { data: DashboardData }) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const budgetPct = data.monthlyBudget > 0 ? Math.round((data.monthlySpending / data.monthlyBudget) * 100) : 0;
    const isOverBudget = budgetPct > 100;
    const budgetColor = isOverBudget ? "#ef4444" : budgetPct > 80 ? "#f59e0b" : "#10b981";

    const now = new Date();
    const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] mb-1">
                        Command <span className="text-indigo-400">Center</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[var(--foreground-muted)] font-medium">Global Perspective</p>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                        </div>
                        {data.lastUpdated && isMounted && (
                            <div className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span className="text-xs">Last Sync: {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="badge badge-primary">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {data.daysSinceFirstTransaction} days tracked
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <StatCard label="Total Balance" value={data.totalBalance} icon={CreditCard} color="indigo" trend="up" trendValue="+2.5%" sparkData={data.runningBalance.map(b => b.balance)} isMounted={isMounted} animateValue={true} />
                <StatCard label="Monthly Spending" value={data.monthlySpending} icon={Zap} color="red" trend="down" trendValue="-4.1%" sparkData={data.spendingTrend.map(s => s.amount)} isMounted={isMounted} animateValue={true} />
                <StatCard label="Monthly Income" value={formatCurrency(data.monthlyIncome)} icon={DollarSign} color="emerald" trend="up" trendValue="+12%" sparkData={data.monthlyOverview.map(m => m.income)} isMounted={isMounted} />
                <StatCard label="Daily Average" value={formatCurrency(data.dailyAverage)} icon={Activity} color="amber" isMounted={isMounted} />
                <StatCard label="Savings Rate" value={`${data.savingsRate}%`} icon={PiggyBank} color="purple" isMounted={isMounted} />
                <StatCard label="Projected Spend" value={formatCurrency(data.projectedMonthlySpend)} icon={Calendar} color="blue" isMounted={isMounted} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 glass-card p-6 pb-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Spending Trend</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">Last 30 days activity</p>
                        </div>
                        <Link href="/analytics" className="btn btn-ghost text-xs">
                            View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.spendingTrend} margin={{ bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="lineGlow" height="200%" width="200%" x="-50%" y="-50%">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b6b80', fontSize: 10 }}
                                        minTickGap={15}
                                        tickFormatter={(str) => {
                                            const d = new Date(str);
                                            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                        }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="none"
                                        fill="url(#spendGradient)"
                                        fillOpacity={1}
                                        tooltipType="none"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        name="Spent"
                                        stroke="#818cf8"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, stroke: '#818cf8', strokeWidth: 0, fill: '#fff', style: { filter: 'url(#lineGlow)' } }}
                                        style={{ filter: 'url(#lineGlow)' }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Budget Gauge - Premium Redesign */}
                <div className="glass-card p-6 pb-6 overflow-hidden relative flex flex-col">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Budget Status</h3>
                    <p className="text-xs text-[var(--foreground-muted)] mb-4">Monthly spending vs. budget</p>

                    <div className="flex flex-col items-center justify-center">
                        {/* Large Gauge Container */}
                        <div className="relative w-full aspect-square max-w-[240px] mx-auto">
                            {/* SVG for Gradients and Filters */}
                            <svg width="0" height="0" className="absolute">
                                <defs>
                                    <linearGradient id="gaugeGradientV2" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={budgetColor} stopOpacity={0.6} />
                                        <stop offset="100%" stopColor={budgetColor} stopOpacity={1} />
                                    </linearGradient>
                                    <filter id="glowV2" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                            </svg>

                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="65%"
                                        outerRadius="82%"
                                        barSize={16}
                                        data={[{ value: Math.min(budgetPct, 100), fill: "url(#gaugeGradientV2)" }]}
                                        startAngle={200}
                                        endAngle={-20}
                                    >
                                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                        <RadialBar
                                            background={{ fill: 'rgba(255,255,255,0.04)' }}
                                            dataKey="value"
                                            cornerRadius={15}
                                            style={{ filter: 'url(#glowV2)' }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            )}

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                <span className="text-5xl font-black tracking-tighter leading-none" style={{ color: budgetColor, textShadow: `0 0 40px ${budgetColor}66` }}>
                                    {budgetPct}
                                    <span className="text-xl font-bold opacity-70 ml-1">%</span>
                                </span>
                                <span className="text-xs font-bold text-white/60 uppercase tracking-[0.3em] mt-1 mb-4">
                                    Used
                                </span>

                                {/* Integrated Stats - positioned in the arc opening */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-center w-full max-w-[240px]">
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-wider mb-0.5">Spent</p>
                                        <p className="text-sm font-bold text-red-400">{formatCurrency(data.monthlySpending)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-wider mb-0.5">Remaining</p>
                                        <p className={`text-sm font-bold ${data.remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(data.remainingBudget)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Stat */}
                        <div className="w-full mt-2 pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                            <span className="text-[var(--foreground-muted)]">Total Budget</span>
                            <span className="font-bold text-[var(--foreground)]">{formatCurrency(data.monthlyBudget)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses */}
                <div className="glass-card p-6 pb-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Cash Flow</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">6-month overview</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /> Income</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" /> Expenses</span>
                        </div>
                    </div>
                    <div className="h-[200px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.monthlyOverview}>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6b80', fontSize: 11 }} tickFormatter={v => formatCompactCurrency(v)} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Line type="monotone" dataKey="net" name="Net Profit" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6b6b80', r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="glass-card p-6 pb-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Spending by Category</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">This month</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative w-44 h-44 flex-shrink-0">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.spendingByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={2} dataKey="value" stroke="none">
                                            {data.spendingByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-[var(--foreground)] leading-tight">{formatCompactCurrency(data.monthlySpending)}</span>
                                <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-tight">Total</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2.5">
                            {data.spendingByCategory.slice(0, 6).map((cat, i) => (
                                <div key={cat.name} className="flex items-center justify-between group/cat cursor-default">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover/cat:scale-125" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm text-[var(--foreground-muted)] group-hover/cat:text-[var(--foreground)] transition-colors">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">{formatCompactCurrency(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget by Category */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Budget Progress</h3>
                    <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
                        {data.categoryBudgets.filter(b => b.budget > 0).map(b => {
                            const over = b.percentage > 100;
                            const warn = b.percentage > 80;
                            const color = over ? "bg-red-500" : warn ? "bg-amber-500" : "bg-emerald-500";
                            return (
                                <div key={b.name}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-[var(--foreground-muted)]">{b.name}</span>
                                        <span className={`font-semibold ${over ? 'text-red-400' : warn ? 'text-amber-400' : 'text-emerald-400'}`}>{b.percentage}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`progress-bar-fill ${color}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Expenses */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Top Expenses</h3>
                    <div className="space-y-3">
                        {data.topExpenses.slice(0, 5).map((e, i) => (
                            <div key={e.Id} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-red-400">#{i + 1}</span>
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

                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2">
                        {data.recentExpenses.slice(0, 6).map(e => (
                            <div key={e.Id} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${e.Amount < 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{e.Comment || e.CategoryName}</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">{new Date(e.Date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className={`text-sm font-bold ${e.Amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(e.Amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

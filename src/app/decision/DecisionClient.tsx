"use client";

import React, { useState, useEffect } from "react";
import {
    Shield, ShieldAlert, Target, TrendingUp, TrendingDown,
    AlertTriangle, Brain, Lock, Zap, Clock, DollarSign,
    CheckCircle, XCircle, ArrowRight, Ghost, RefreshCw,
    Scale, AlertOctagon, Activity, Calendar, Trash2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface StrategicMetrics {
    ada: number;
    adaStatus: 'optimal' | 'warning' | 'crisis';
    velocity: {
        timePct: number;
        moneyPct: number;
        status: 'ahead' | 'behind';
    };
    ironBuffer: {
        id: number;
        name: string;
        budget: number;
        spent: number;
        isCovered: boolean;
        remaining: number;
    }[];
    theft: {
        total: number;
        impactDays: number;
    };
    unknowns: {
        comment: string;
        count: number;
        total: number;
    }[];
    debt: {
        name: string;
        budget: number;
        paid: number;
    }[];
    allocation: {
        ratio: number;
        score: string;
        adaModifier: boolean;
        trend: 'improving' | 'worsening' | 'stable';
    };
    freedom: {
        monthlyDebtTarget: number;
        actualDebtPaid: number;
        survivalNeutralDebt: number;
        sustainabilityScore: number;
    };
    recovery: {
        deficitCarryOver: number;
        status: 'neutral' | 'recovering';
        monthsToRecover: number;
        sensitivity: number;
        recoveryTarget: number;
    };
    revenue: {
        sideHustleEarned: number;
        nextBoostValue: number;
    };
    ghostBuffer: {
        amount: number;
        rate: number;
    };
    liquidity: {
        status: 'secure' | 'lockdown';
        cashRemaining: number;
        ironRemaining: number;
        coverageRatio: number;
    };
    forecast: {
        nextMonthReadiness: number;
        status: 'secure' | 'danger';
        deferredBillsSuggestion: string[];
    };
    behavior: {
        archetype: 'Weekend Leak' | 'Impulse Spike' | 'Steady' | 'None';
        highRiskDays: string[];
    };
}

export default function DecisionClient({ data }: { data: StrategicMetrics }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [simulatedDebtPayment, setSimulatedDebtPayment] = useState<number | null>(null);

    useEffect(() => setIsMounted(true), []);


    const isLockdown = data.liquidity.status === 'lockdown' && !isAcknowledged;

    // Simulation Logic
    const currentDebtPaid = simulatedDebtPayment ?? data.freedom.actualDebtPaid;
    const debtDifference = data.freedom.actualDebtPaid - currentDebtPaid;
    // If I pay LESS debt, my Available increases, so ADA increases.
    // ADA Change = DebtDifference / DaysRemaining?
    // Not exactly, ADA formula treats "Debt Budget" as fixed?
    // Wait, ADA formula in strategy.ts uses fixed budgets.
    // The "Sustainability Score" logic suggested we are over-paying.
    // The simulator should show: "If you reduce debt payment to X, your 'Virtual ADA' becomes Y".
    // Virtual ADA = Current ADA + (DebtDifference / DaysRemaining).
    // Let's approximate days remaining from the boost value.
    const daysRemaining = Math.max(1, Math.round(100 / data.revenue.nextBoostValue));
    const virtualADA = data.ada + (debtDifference / daysRemaining);

    const adaColor = (simulatedDebtPayment !== null ? virtualADA : data.ada) < 0 ? 'text-red-500' : 'text-emerald-400';
    const velColor = data.velocity.status === 'ahead' ? 'bg-emerald-500' : 'bg-red-500';

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto relative">
            {/* Liquidity Lockdown Overlay Effect */}
            {isLockdown && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative bg-red-950 border border-red-500 p-8 rounded-2xl max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-in fade-in zoom-in duration-300">
                        <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-2xl font-black text-white uppercase mb-2">Total Liquidity Failure</h2>
                        <p className="text-red-200 mb-6">
                            You cannot afford your remaining Iron Obligations.
                            <span className="block text-xs text-red-300 mt-1">(Includes Fixed Bills & Daily Transport)</span>
                            <span className="font-bold text-white block mt-2 text-lg">
                                Missing: {formatCurrency(data.liquidity.ironRemaining - data.liquidity.cashRemaining)}
                            </span>
                        </p>
                        <button
                            onClick={() => setIsAcknowledged(true)}
                            className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg uppercase text-sm tracking-wider transition-colors shadow-lg shadow-red-900/50"
                        >
                            I Acknowledge - Stop Flex Spending
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider">
                        Command Center <span className="text-xs text-[var(--foreground-muted)] align-top ml-1">V4</span>
                    </h1>
                    <p className="text-[var(--foreground-muted)] font-mono text-sm mt-1">
                        AUTONOMOUS STRATEGIST PREVIEW
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {data.recovery.status === 'recovering' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5">
                            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                            <span className="text-xs font-bold text-amber-500 tracking-wider">RECOVERY ACTIVE</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/5">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-red-400 tracking-wider">LIVE DATA</span>
                    </div>
                </div>
            </div>

            {/* VIEW 1: TACTICAL SURVIVAL */}
            <section className={`space-y-4 transition-opacity duration-500 ${isLockdown ? 'opacity-20 blur-sm' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-[var(--foreground)]" />
                    <h2 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-wide">Tactical Survival</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main ADA (Safe to Spend) HUD */}
                    <div className="lg:col-span-2 glass-card p-8 flex flex-col justify-between relative group overflow-hidden min-h-[300px]">
                        {/* Background Glow */}
                        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-20 transition-colors duration-500
                                ${data.adaStatus === 'crisis' ? 'bg-red-500' : 'bg-emerald-500'}`} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Safe to Spend Daily
                                </h2>
                                <p className="text-xs text-[var(--foreground-muted)] opacity-60">Money you can spend today without worry.</p>
                            </div>

                            {/* Visual Status Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-2
                                ${data.adaStatus === 'optimal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    data.adaStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                        'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${data.adaStatus === 'optimal' ? 'bg-emerald-500' : data.adaStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                {data.adaStatus === 'optimal' ? 'Healthy' : data.adaStatus === 'warning' ? 'Caution' : 'Critical'}
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 mb-8">
                            <h3 className={`text-6xl lg:text-7xl font-black tracking-tighter ${adaColor} transition-all duration-300 whitespace-nowrap`}>
                                {formatCurrency(simulatedDebtPayment !== null ? virtualADA : data.ada)}
                            </h3>
                            <p className="text-sm font-medium text-[var(--foreground-muted)] mt-2 flex items-center gap-2">
                                {data.ada >= 0 ? (
                                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> You're on track.</span>
                                ) : (
                                    <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Stop spending immediately.</span>
                                )}
                            </p>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                            <div>
                                <p className="text-[10px] uppercase text-[var(--foreground-muted)] font-bold mb-1">Spending Speed</p>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 flex-1 rounded-full bg-[var(--surface)] overflow-hidden`}>
                                        <div className={`h-full rounded-full ${data.velocity.status === 'ahead' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(100, (data.velocity.moneyPct / data.velocity.timePct) * 100)}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold ${data.velocity.status === 'ahead' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {data.velocity.status === 'ahead' ? 'Good' : 'Too Fast'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-[var(--foreground-muted)] font-bold mb-1">Side Hustle Reward</p>
                                <p className="text-xs font-bold text-[var(--foreground)]">+{data.revenue.nextBoostValue} DH <span className="text-[var(--foreground-muted)] font-normal">/ 100 earned</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Next Month Forecast (Simplified) */}
                    <div className="glass-card p-6 flex flex-col justify-between relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div>
                            <h2 className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" /> Next Month
                            </h2>
                            <p className="text-xs text-[var(--foreground-muted)] opacity-60">Projected Day 1 Balance</p>
                        </div>

                        <div className="py-6">
                            <h3 className={`text-3xl font-black ${data.forecast.nextMonthReadiness < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {formatCurrency(data.forecast.nextMonthReadiness)}
                            </h3>
                        </div>

                        {data.forecast.nextMonthReadiness < 0 ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                                <p className="text-xs text-red-300 font-bold flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-3 h-3" /> Danger
                                </p>
                                <p className="text-[10px] text-red-200/80">
                                    You will start next month in debt. Defer <span className="text-white font-bold underline">{data.forecast.deferredBillsSuggestion[0]}</span> bill.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                <p className="text-xs text-emerald-300 font-bold flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-3 h-3" /> Secure
                                </p>
                                <p className="text-[10px] text-emerald-200/80">
                                    You're set for a positive start next month. Keep it up!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* VIEW 2: SAVINGS & RECOVERY */}
            <section className={`space-y-4 transition-opacity duration-500 ${isLockdown ? 'opacity-20 blur-sm' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-wide">Analysis & Recovery</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Money Wasted (Theft) */}
                    <div className="glass-card p-6 flex flex-col relative group">
                        <h3 className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-4 flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-red-500" /> Money Wasted
                        </h3>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32 mb-4">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={8}
                                            data={[{ value: 100, fill: '#333' }]}
                                            startAngle={90} endAngle={-270}
                                        >
                                            <RadialBar dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-black text-red-500">{formatCurrency(data.theft.total)}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-center text-[var(--foreground-muted)]">
                                Money spent on things you didn't plan for.
                            </p>
                        </div>
                    </div>

                    {/* Time to Freedom (Recovery) */}
                    <div className="glass-card p-6 bg-indigo-500/5 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Time to Freedom
                            </h3>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-indigo-400">
                                    {data.recovery.monthsToRecover} <span className="text-lg text-[var(--foreground)]">Months</span>
                                </p>
                                <p className="text-xs text-[var(--foreground-muted)] opacity-80">
                                    Recovery Target: <span className="text-white font-bold">{formatCurrency(data.recovery.recoveryTarget)}/mo</span>
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-indigo-500/20 space-y-3">
                                <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
                                    <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Command:</p>
                                    <p className="text-xs text-indigo-100">
                                        Reduce lifestyle spending or earn extra to hit the <span className="font-bold underline">{formatCurrency(data.recovery.recoveryTarget)}</span> monthly target.
                                    </p>
                                </div>
                                <p className="text-[10px] text-indigo-300">
                                    <span className="font-bold">Fact:</span> Spending 100 DH adds <span className="font-bold underline">{data.recovery.sensitivity} days</span> to this time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Impact (Consequence) */}
                    <div className="glass-card p-6 bg-red-500/5 flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Real Impact
                        </h3>
                        <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed mb-4">
                            You could have paid for <span className="text-red-500 font-bold text-lg">{Math.floor(data.theft.total / 1150)} months</span> of School with this wasted money.
                        </p>
                        <div className="w-full bg-[var(--surface)] h-1 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full w-[24%]" />
                        </div>
                        <p className="text-[10px] text-right text-red-400 mt-1 font-mono">24% of Budget Lost</p>
                    </div>

                    {/* Top Leaks */}
                    <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-4">Top Leaks</h3>
                        <div className="space-y-3">
                            {data.unknowns.length > 0 ? (
                                data.unknowns.slice(0, 3).map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)]">
                                        <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-[100px]">
                                            {u.comment}
                                        </span>
                                        <span className="text-xs font-bold text-red-400">{formatCurrency(u.total)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 opacity-40">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                                    <p className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold">No leaks detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* VIEW 3: STRATEGIC LIABILITIES */}
            <section className={`space-y-4 transition-opacity duration-500 ${isLockdown ? 'opacity-20 blur-sm' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-wide">Strategic Liabilities</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Simulator Card - Only show if there is Debt */}
                    {data.debt.length > 0 ? (
                        <div className="glass-card p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase">Debt Simulator</h3>
                                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                        What-if: Adjust debt payment to fix ADA difficulty.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSimulatedDebtPayment(data.freedom.survivalNeutralDebt)}
                                    className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded text-[10px] font-bold uppercase transition-colors"
                                >
                                    Set to Neutral Target
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="relative pt-6 pb-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max={data.freedom.actualDebtPaid * 1.5}
                                        step="100"
                                        value={simulatedDebtPayment ?? data.freedom.actualDebtPaid}
                                        onChange={(e) => setSimulatedDebtPayment(Number(e.target.value))}
                                        className="w-full h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                    <div className="flex justify-between text-xs font-mono text-[var(--foreground-muted)] mt-2">
                                        <span>0 DH</span>
                                        <span>{formatCurrency(simulatedDebtPayment ?? data.freedom.actualDebtPaid)}</span>
                                        <span>{formatCurrency(data.freedom.actualDebtPaid * 1.5)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--glass-border)]">
                                    <div>
                                        <p className="text-[10px] text-[var(--foreground-muted)] uppercase">Projected Savings Impact</p>
                                        <p className={`text-lg font-bold ${data.freedom.actualDebtPaid > (simulatedDebtPayment ?? 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatCurrency(Math.abs(data.freedom.actualDebtPaid - (simulatedDebtPayment ?? data.freedom.actualDebtPaid)))}
                                            <span className="text-xs text-[var(--foreground-muted)] ml-1">
                                                {data.freedom.actualDebtPaid > (simulatedDebtPayment ?? 0) ? 'saved' : 'extra paid'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--foreground-muted)] uppercase">Survival Neutral Cap</p>
                                        <p className="text-lg font-bold text-white">{formatCurrency(data.freedom.survivalNeutralDebt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-6 flex flex-col justify-center items-center text-center opacity-70">
                            <Shield className="w-12 h-12 text-teal-500 mb-4 opacity-50" />
                            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase">Operational Solvency Focus</h3>
                            <p className="text-xs text-[var(--foreground-muted)] mt-2 max-w-xs">
                                You are debt-free. Your focus is now on maintaining the Iron Buffer and optimizing Operational Efficiency.
                            </p>
                            <div className="mt-6 w-full bg-[var(--background-secondary)] rounded-lg p-3 border border-[var(--glass-border)]">
                                <div className="flex justify-between text-xs font-mono mb-1">
                                    <span>IRON COVERAGE</span>
                                    <span className={data.liquidity.coverageRatio >= 100 ? "text-emerald-400" : "text-amber-400"}>
                                        {data.liquidity.coverageRatio.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--surface)] rounded-full overflow-hidden">
                                    {/* Clamp negative width to 0% */}
                                    <div className={`h-full ${data.liquidity.coverageRatio >= 100 ? "bg-emerald-500" : "bg-red-500"} transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, data.liquidity.coverageRatio))}%` }} />
                                </div>
                                {data.liquidity.coverageRatio < 0 && (
                                    <p className="text-[10px] text-red-400 mt-2 font-bold uppercase">
                                        Negative Solvency
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Health Grade with Trend */}
                    <div className="glass-card p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase mb-1">Financial Health Grade</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-[var(--foreground-muted)]">Recovery Trend:</span>
                                {data.allocation.trend === 'improving' ? (
                                    <span className="flex items-center text-xs font-bold text-emerald-400">
                                        <TrendingUp className="w-3 h-3 mr-1" /> Improving
                                    </span>
                                ) : data.allocation.trend === 'worsening' ? (
                                    <span className="flex items-center text-xs font-bold text-red-400">
                                        <TrendingDown className="w-3 h-3 mr-1" /> Worsening
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-[var(--foreground-muted)]">Stable</span>
                                )}
                            </div>

                            {data.allocation.adaModifier && (
                                <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-wider">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    Capped by Negative ADA
                                </p>
                            )}
                        </div>
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black border-4 
                            ${data.allocation.score === 'A' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' :
                                data.allocation.score === 'B' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                    data.allocation.score === 'C' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                                        'border-red-600 text-red-600 bg-red-600/10'}`}>
                            {data.allocation.score}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

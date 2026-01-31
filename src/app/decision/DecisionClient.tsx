"use client";

import React, { useState, useEffect } from "react";
import {
    Shield, ShieldAlert, Target, TrendingUp, TrendingDown,
    AlertTriangle, Brain, Lock, Zap, Clock, DollarSign,
    CheckCircle, XCircle, ArrowRight, Ghost, RefreshCw,
    Scale, AlertOctagon, Activity, Calendar
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
                    {/* ADA HUD */}
                    <div className={`glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden group ${data.adaStatus === 'crisis' ? 'border-red-500' : ''}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

                        {/* Simulation Indicator */}
                        {simulatedDebtPayment !== null && (
                            <div className="absolute top-4 left-4 bg-teal-500/20 text-teal-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse border border-teal-500/50">
                                Simulation Active
                            </div>
                        )}

                        <span className="text-xs font-mono text-[var(--foreground-muted)] uppercase mb-4">Adjusted Daily Allowance</span>
                        <div className="relative">
                            <h3 className={`text-6xl lg:text-7xl font-black tracking-tighter ${adaColor} drop-shadow-2xl transition-all duration-300`}>
                                {formatCurrency(simulatedDebtPayment !== null ? virtualADA : data.ada)}
                            </h3>
                        </div>
                        <p className={`mt-4 text-sm font-bold uppercase tracking-widest ${adaColor} text-center`}>
                            {(simulatedDebtPayment !== null ? virtualADA : data.ada) >= 0 ? 'Safe to Spend' : 'Restricted Mode'}
                        </p>

                        <div className="mt-6 pt-4 border-t border-white/5 w-full text-center">
                            <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">
                                <Zap className="w-3 h-3 inline-block mr-1 text-yellow-400" />
                                Side Hustle Boost: <span className="text-[var(--foreground)] font-bold">+ {data.revenue.nextBoostValue} DH / 100 earned</span>
                            </p>
                        </div>
                    </div>

                    {/* Behavioral Insight (Replaces Velocity Sync in V4 emphasis?) No, add below or replace. Let's keep Velocity but add Behavior card. */}
                    <div className="glass-card p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-bold text-[var(--foreground)] uppercase">Behavioral Risk</span>
                            </div>

                            {data.behavior.archetype !== 'None' ? (
                                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                                    <h4 className="text-purple-300 font-bold uppercase text-xs mb-1">Pattern Detected</h4>
                                    <p className="text-lg font-bold text-white mb-2">{data.behavior.archetype}</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">
                                        High spending detected on <span className="text-purple-300 font-bold">{data.behavior.highRiskDays.join(' & ')}</span>.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 opacity-50">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs uppercase font-bold">No Risk Patterns</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--foreground-muted)] uppercase">Velocity Sync</span>
                                <span className={data.velocity.status === 'ahead' ? 'text-emerald-400' : 'text-red-400'}>
                                    {data.velocity.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Iron Forecast (Replaces Iron Buffer in prime spot?) */}
                    <div className="glass-card p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold text-[var(--foreground)] uppercase">Next Month Forecast</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center text-center">
                            <p className="text-xs text-[var(--foreground-muted)] uppercase mb-2">Projected Starting Balance</p>
                            <h3 className={`text-3xl font-black ${data.forecast.nextMonthReadiness < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {formatCurrency(data.forecast.nextMonthReadiness)}
                            </h3>
                            {data.forecast.nextMonthReadiness < 0 && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded">
                                    <p className="text-[10px] text-red-300 uppercase font-bold mb-1">Action Required</p>
                                    <p className="text-xs text-red-200">
                                        Defer <span className="font-bold text-white">{data.forecast.deferredBillsSuggestion[0]}</span> bill to avoid Day 1 failure.
                                    </p>
                                </div>
                            )}
                        </div>
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
                    {/* Theft Gauge */}
                    <div className="glass-card p-6 flex flex-col items-center justify-center relative">
                        <h3 className="text-xs font-mono text-[var(--foreground-muted)] uppercase mb-2">Capital Stolen</h3>
                        <div className="relative w-40 h-40">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" barSize={10}
                                        data={[{ value: 100, fill: '#333' }]}
                                        startAngle={90} endAngle={-270}
                                    >
                                        <RadialBar dataKey="value" cornerRadius={10} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-red-500">{formatCurrency(data.theft.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Squeeze Factor */}
                    <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Recovery Horizon
                        </h3>
                        <div className="space-y-2">
                            <p className="text-3xl font-black text-indigo-400">
                                {data.recovery.monthsToRecover} <span className="text-lg text-[var(--foreground)]">Months</span>
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">
                                of aggressive squeeze
                            </p>
                        </div>
                        {/* Sensitivity Badge */}
                        <div className="mt-6 flex items-center gap-2 bg-indigo-500/20 px-3 py-2 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-indigo-300" />
                            <p className="text-[10px] text-indigo-200 leading-tight">
                                <span className="font-bold text-indigo-100">Warning:</span> Spending 100 DH adds <span className="font-bold underline">{data.recovery.sensitivity} days</span> to this countdown.
                            </p>
                        </div>
                    </div>

                    {/* Consequence */}
                    <div className="glass-card p-6 bg-red-500/5 border-red-500/20 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Consequence
                        </h3>
                        {data.debt.length > 0 ? (
                            <p className="text-xl font-medium text-[var(--foreground)] leading-relaxed">
                                Your overspending has delayed your debt freedom by <span className="text-red-500 font-bold text-3xl mx-1">{data.theft.impactDays}</span> days.
                            </p>
                        ) : (
                            <p className="text-xl font-medium text-[var(--foreground)] leading-relaxed">
                                Your flex spending consumed <span className="text-red-500 font-bold text-3xl mx-1">
                                    {((data.theft.total / data.ironBuffer.reduce((acc: number, item: any) => acc + item.budget, 0)) * 100).toFixed(0)}%
                                </span> of your Iron Budget.
                            </p>
                        )}
                        {data.debt.length === 0 && (
                            <p className="text-xs text-[var(--foreground-muted)] mt-2">
                                That's enough to pay for <strong>{Math.floor(data.theft.total / 1150)} months</strong> of School.
                            </p>
                        )}
                    </div>

                    {/* Unknown Pareto */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase mb-4">Top "Unknown" Leaks</h3>
                        <div className="space-y-3">
                            {data.unknowns.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded bg-[var(--background-secondary)] hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer group">
                                    <span className="text-sm font-mono text-[var(--foreground)] group-hover:text-red-400 transition-colors">
                                        {u.comment}
                                    </span>
                                    <span className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(u.total)}</span>
                                </div>
                            ))}
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

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
        impactNarrative: string;
        dopamineSwap: string;
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
        essential: number;
        lifestyle: number;
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
        recoveryBonus: number;
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
        isHardLocked: boolean;
        bufferReboundPct: number;
        nextMilestone: number;
        milestoneProgress: number;
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

    const daysRemaining = Math.max(1, Math.round(100 / data.revenue.nextBoostValue));
    const debtDifference = data.freedom.actualDebtPaid - (simulatedDebtPayment ?? data.freedom.actualDebtPaid);
    const virtualADA = data.ada + (debtDifference / daysRemaining);

    const simulatedDebtValue = simulatedDebtPayment ?? data.freedom.actualDebtPaid;
    const debtSliderMax = Math.max(data.freedom.monthlyDebtTarget, data.freedom.actualDebtPaid, 0);
    const debtStep = debtSliderMax > 0 ? Math.max(1, Math.round(debtSliderMax / 20)) : 1;
    const hasDebtSimulation = debtSliderMax > 0;
    const actualDebtPct = debtSliderMax > 0 ? Math.min(100, Math.max(0, (data.freedom.actualDebtPaid / debtSliderMax) * 100)) : 0;
    const isSimulatingDebt = simulatedDebtPayment !== null && simulatedDebtPayment !== data.freedom.actualDebtPaid;

    const effectiveADA = simulatedDebtPayment !== null ? virtualADA : data.ada;
    const isNegativeADA = effectiveADA < 0;
    const adaColor = isNegativeADA ? 'text-red-500' : 'text-emerald-400';
    const adaReason = data.liquidity.isHardLocked ? 'Liquidity Lock' : isNegativeADA ? 'Negative ADA' : data.adaStatus === 'warning' ? 'Below Threshold' : '';
    const adaReasonTone = data.liquidity.isHardLocked || isNegativeADA ? 'text-red-400' : 'text-amber-400';

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto relative">
            {/* Liquidity Lockdown Overlay */}
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
                        Command Center
                    </h1>
                    <p className="text-[var(--foreground-muted)] font-mono text-sm mt-1">
                        AUTONOMOUS STRATEGIST
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
                        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-20 transition-colors duration-500
                                ${data.adaStatus === 'crisis' ? 'bg-red-500' : 'bg-emerald-500'}`} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Safe to Spend Daily
                                </h2>
                                <p className="text-xs text-[var(--foreground-muted)] opacity-60">Money you can spend today without worry.</p>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-2
                                ${data.adaStatus === 'optimal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    data.adaStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                        'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${data.adaStatus === 'optimal' ? 'bg-emerald-500' : data.adaStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                {data.adaStatus === 'optimal' ? 'Healthy' : data.adaStatus === 'warning' ? 'Caution' : 'Critical'}
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 mb-8">
                            <div className="flex items-end gap-3">
                                <h3 className={`text-6xl lg:text-7xl font-black tracking-tighter ${adaColor} transition-all duration-300 whitespace-nowrap`}>
                                    {data.liquidity.isHardLocked ? formatCurrency(0) : formatCurrency(simulatedDebtPayment !== null ? virtualADA : data.ada)}
                                </h3>
                                {data.liquidity.isHardLocked && (
                                    <div className="mb-2 px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Locked
                                    </div>
                                )}
                            </div>
                            {adaReason && (
                                <p className={`mt-1 text-[10px] uppercase tracking-widest ${adaReasonTone}`}>
                                    Reason: {adaReason}
                                </p>
                            )}
                            <p className="text-sm font-medium text-[var(--foreground-muted)] mt-2 flex items-center gap-2">
                                {data.liquidity.isHardLocked ? (
                                    <span className="text-red-500 flex items-center gap-1 font-bold animate-pulse"><AlertTriangle className="w-4 h-4" /> SURVIVAL LOCK: Every DH spent today puts your bills at risk.</span>
                                ) : data.ada >= 0 ? (
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

                        {hasDebtSimulation && (
                            <div className="relative z-10 mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] uppercase text-[var(--foreground-muted)] font-bold tracking-wider">Debt Simulation</p>
                                    <button
                                        type="button"
                                        onClick={() => setSimulatedDebtPayment(null)}
                                        className="text-[10px] font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className="mt-2 relative">
                                    <div className="absolute left-0 right-0 top-1.5 h-1 rounded-full bg-white/5 pointer-events-none" />
                                    <div
                                        className="absolute top-0 h-4 w-px bg-white/40 pointer-events-none"
                                        style={{ left: `${actualDebtPct}%` }}
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={debtSliderMax}
                                        step={debtStep}
                                        value={simulatedDebtValue}
                                        onChange={(e) => setSimulatedDebtPayment(Number(e.target.value))}
                                        className="w-full accent-emerald-400"
                                    />
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--foreground-muted)]">
                                    <span>0</span>
                                    <span>Target {formatCurrency(data.freedom.monthlyDebtTarget)}</span>
                                </div>
                                <div className="mt-2 text-xs text-[var(--foreground)]">
                                    Simulated Paid: <span className="font-bold">{formatCurrency(simulatedDebtValue)}</span>
                                    <span className={`ml-2 ${isSimulatingDebt ? 'text-amber-300' : 'text-[var(--foreground-muted)]'}`}>
                                        Actual: {formatCurrency(data.freedom.actualDebtPaid)}
                                    </span>
                                    {isSimulatingDebt && (
                                        <span className="ml-2 text-[10px] text-amber-300 uppercase tracking-wider">Simulating</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Month Forecast */}
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
                    {/* Money Wasted */}
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
                            <p className="text-[10px] text-center text-[var(--foreground-muted)]">Unplanned spending leaks.</p>
                        </div>
                    </div>

                    {/* Time to Freedom */}
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
                                    Goal: <span className="text-white font-bold">{formatCurrency(data.recovery.recoveryTarget)}/mo</span>
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-indigo-500/20 space-y-3">
                                <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-100">
                                    <p className="font-bold uppercase text-indigo-300 mb-1">Command:</p>
                                    Reduce lifestyle spending to hit target.
                                </div>
                                <p className="text-[10px] text-indigo-300 italic">
                                    Fact: 100 DH spend = +{data.recovery.sensitivity} days debt.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Real Impact */}
                    <div className="glass-card p-6 bg-red-500/5 flex flex-col justify-center border-l-2 border-red-500/50">
                        <h3 className="text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Real Impact
                        </h3>
                        <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed mb-4 italic">
                            {data.theft.impactNarrative}
                        </p>
                        <div className="mt-auto pt-4 border-t border-red-500/10">
                            <p className="text-[10px] text-red-300 font-bold uppercase mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" /> Dopamine Swap:
                            </p>
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-100 italic">
                                "{data.theft.dopamineSwap}"
                            </div>
                        </div>
                    </div>

                    {/* Top Leaks */}
                    <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-4">Top Leaks</h3>
                        <div className="space-y-3">
                            {data.unknowns.length > 0 ? (
                                data.unknowns.slice(0, 3).map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)]">
                                        <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-[100px]">{u.comment}</span>
                                        <span className="text-xs font-bold text-red-400">{formatCurrency(u.total)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 opacity-40">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                                    <p className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold">No leaks</p>
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
                    <h2 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-wide">Strategic Assets & Grade</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Buffer Restoration HUD */}
                    <div className="glass-card p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-24 h-24 text-teal-500" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-teal-400 uppercase mb-1 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Buffer Restoration
                            </h3>
                            <p className="text-[10px] text-[var(--foreground-muted)] uppercase mb-6">REBUILDING IRON RESERVES</p>

                            <div className="space-y-6">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">Iron Solvency</p>
                                        <p className={`text-2xl font-black ${data.liquidity.coverageRatio >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {data.liquidity.bufferReboundPct.toFixed(0)}%
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[var(--foreground-muted)] uppercase">Target</p>
                                        <p className="text-sm font-bold text-[var(--foreground-muted)]">100% Secure</p>
                                    </div>
                                </div>

                                <div className="relative h-6 w-full bg-[var(--surface)] rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`absolute left-0 top-0 h-full transition-all duration-1000 ${data.liquidity.coverageRatio >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.max(0, Math.min(100, data.liquidity.bufferReboundPct))}%` }}
                                    />
                                    {data.liquidity.bufferReboundPct < 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                                            <span className="text-[10px] font-black text-red-100 uppercase tracking-widest animate-pulse">Deficit State</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[8px] text-[var(--foreground-muted)] uppercase mb-1">Next Milestone</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-white">-{data.liquidity.nextMilestone} DH</p>
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500" style={{ width: `${data.liquidity.milestoneProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                                        <p className="text-[8px] text-teal-300 uppercase mb-1">Current Gap</p>
                                        <p className="text-xs font-bold text-white">{formatCurrency(Math.max(0, data.liquidity.ironRemaining - data.liquidity.cashRemaining))}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Grade */}
                    <div className="glass-card p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase mb-1">Financial Health Grade</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-[var(--foreground-muted)]">Trend:</span>
                                    {data.allocation.trend === 'improving' ? (
                                        <span className="flex items-center text-xs font-bold text-emerald-400"><TrendingUp className="w-3 h-3 mr-1" /> Improving</span>
                                    ) : data.allocation.trend === 'worsening' ? (
                                        <span className="flex items-center text-xs font-bold text-red-400"><TrendingDown className="w-3 h-3 mr-1" /> Worsening</span>
                                    ) : (
                                        <span className="text-xs font-bold text-[var(--foreground-muted)]">Stable</span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-6xl font-black border-4 
                                ${data.allocation.score === 'A' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
                                    data.allocation.score === 'B' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                        data.allocation.score === 'C' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                                            'border-red-600 text-red-600 bg-red-600/10'}`}>
                                {data.allocation.score}
                            </div>
                        </div>

                        {data.allocation.adaModifier && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                                <p className="text-[10px] text-red-100 font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-500/20 border border-red-500/30 flex items-center w-fit">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" /> Capped by Negative ADA
                                </p>
                                {data.recovery.recoveryBonus > 0 && (
                                    <div className="px-2 py-1.5 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 w-fit">
                                        <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Bonus: +{formatCurrency(data.recovery.recoveryBonus)} Potential</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

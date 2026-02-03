import { db } from './db';
import dna from './financial-dna.json';

export interface StrategicMetrics {
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
        score: string;
        ratio: number;
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

export function getStrategicMetrics(): StrategicMetrics {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);

    const getCategoryStats = (id: number) => {
        const cat = db.prepare('SELECT Name, Budget FROM Category WHERE Id = ?').get(id) as { Name: string, Budget: number };
        const expense = db.prepare('SELECT SUM(ABS(Amount)) as total FROM Expense WHERE CategoryId = ? AND Date LIKE ? AND Amount < 0').get(id, currentMonth + '%') as { total: number };
        const income = db.prepare('SELECT SUM(Amount) as total FROM Expense WHERE CategoryId = ? AND Date LIKE ? AND Amount > 0').get(id, currentMonth + '%') as { total: number };
        return {
            name: cat?.Name || 'Unknown',
            budget: cat?.Budget || 0,
            spent: expense?.total || 0,
            earned: income?.total || 0
        };
    };

    const incomeStats = getCategoryStats(dna.incomeCategoryId);
    const monthlyIncome = Math.abs(incomeStats.budget);

    let totalFixedBudget = 0;
    let totalFixedSpent = 0;
    let totalIronRemaining = 0;

    const ironBuffer = dna.fixedCategoryIds.map(id => {
        const s = getCategoryStats(id);
        const budget = Math.abs(s.budget);
        totalFixedBudget += budget;
        totalFixedSpent += s.spent;
        const remaining = Math.max(0, budget - s.spent);
        totalIronRemaining += remaining;
        return {
            id,
            name: s.name,
            budget: budget,
            spent: s.spent,
            isCovered: s.spent >= budget * 0.9,
            remaining
        };
    });

    let totalFlexBudget = 0;
    let totalFlexSpent = 0;
    dna.flexCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        totalFlexBudget += Math.abs(s.budget);
        totalFlexSpent += s.spent;
    });

    const lastMonthIncome = (db.prepare(`SELECT SUM(Amount) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(lastMonth + '%') as { total: number }).total || 0;
    const lastMonthExpense = (db.prepare(`SELECT SUM(ABS(Amount)) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(lastMonth + '%') as { total: number }).total || 0;
    const lastMonthNet = lastMonthIncome - lastMonthExpense;
    const deficitCarryOver = lastMonthNet < 0 ? Math.abs(lastMonthNet) : 0;
    const ghostBufferAmount = monthlyIncome * dna.volatilityReserveRate;

    const sideHustleStats = getCategoryStats(dna.sideHustleCategoryId);
    const sideHustleEarned = sideHustleStats.earned;

    let totalDebtBudget = 0;
    dna.debtCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        totalDebtBudget += Math.abs(s.budget);
    });

    const debtItems = dna.debtCategoryIds.map(id => {
        const s = getCategoryStats(id);
        return { name: s.name, budget: Math.abs(s.budget), paid: s.spent };
    });
    const totalDebtPaid = debtItems.reduce((acc, d) => acc + d.paid, 0);

    const totalSpentToDate = totalFixedSpent + totalFlexSpent + totalDebtPaid;
    const currentCashRemaining = (monthlyIncome + sideHustleEarned) - totalSpentToDate;

    const liquidityStatus = currentCashRemaining < totalIronRemaining ? 'lockdown' : 'secure';
    const coverageRatio = totalIronRemaining > 0 ? (currentCashRemaining / totalIronRemaining) * 100 : 100;

    const effectiveDisposable = (monthlyIncome + sideHustleEarned) - totalFixedBudget - totalDebtBudget - ghostBufferAmount - deficitCarryOver;
    let ada = (effectiveDisposable - totalFlexSpent) / daysRemaining;

    const isHardLocked = currentCashRemaining < totalIronRemaining;
    if (isHardLocked && ada > 0) ada = 0;

    const timePct = (dayOfMonth / daysInMonth) * 100;
    const moneyPct = totalFlexBudget > 0 ? (totalFlexSpent / totalFlexBudget) * 100 : 0;
    const velocityStatus = moneyPct > timePct ? 'behind' : 'ahead';

    let theftTotal = 0;
    const leakDetails: { comment: string, total: number }[] = [];
    dna.flexCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        const budget = Math.abs(s.budget);
        if (s.spent > budget) {
            const diff = s.spent - budget;
            theftTotal += diff;
            leakDetails.push({ comment: s.name, total: diff });
        }
    });
    leakDetails.sort((a, b) => b.total - a.total);

    const totalDeficit = deficitCarryOver + (ada < 0 ? Math.abs(ada * daysRemaining) : 0);
    const recoveryTargetIncome = dna.recoveryTargetIncome;
    const monthsToRecover = totalDeficit > 0 && recoveryTargetIncome > 0 ? (totalDeficit / recoveryTargetIncome) : 0;
    const sensitivity = recoveryTargetIncome > 0 ? (100 / recoveryTargetIncome) * 30 : 0;

    const narratives = [
        `You could have paid for ${Math.floor(theftTotal / 1150)} months of School.`,
        `This waste is equal to ${Math.round(theftTotal / 45)} full days of healthy food.`,
        `This could have funded ${(theftTotal / 250).toFixed(1)} doctor visits.`,
        `You are trading your Future Security for temporary dopamine.`
    ];
    const impactNarrative = narratives[dayOfMonth % narratives.length];

    const currentGap = Math.max(0, totalIronRemaining - currentCashRemaining);
    const milestoneChunk = 500;
    const nextMilestone = currentGap > 0 ? (Math.floor(currentGap / milestoneChunk) * milestoneChunk) : 0;
    const milestoneRemainder = currentGap % milestoneChunk;
    const milestoneProgress = currentGap > 0 ? (1 - (milestoneRemainder / milestoneChunk)) * 100 : 100;

    const swaps = [
        "Skip the delivery; try that complex recipe you've been eyeing. +40 DH win.",
        "Go for a 30-min run instead of browsing online stores. Dopamine is free.",
        "Organize your wardrobe; you'll find 'new' clothes you forgot you had.",
        "Read 10 pages of a book to kill the scroll-and-shop urge.",
        "Call a friend for 20 mins instead of stress-eating outside."
    ];
    const dopamineSwap = leakDetails.length > 0
        ? (leakDetails[0].comment.includes('Food') ? swaps[0] : (leakDetails[0].comment.includes('Shopping') ? swaps[2] : swaps[1]))
        : swaps[dayOfMonth % swaps.length];

    let recoveryBonus = 0;
    dna.lifestyleCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        const budget = Math.abs(s.budget);
        if (s.spent < budget) recoveryBonus += (budget - s.spent) * 0.05;
    });

    const resources = monthlyIncome + sideHustleEarned - ghostBufferAmount - deficitCarryOver;
    const survivalNeutralDebt = Math.max(0, resources - totalFixedBudget - totalFlexSpent);
    const sustainabilityScore = totalDebtPaid > 0 ? (survivalNeutralDebt / totalDebtPaid) * 100 : 100;

    const nextMonthReadiness = monthlyIncome - totalDeficit - totalFixedBudget;
    let deferredBillsSuggestion: string[] = [];
    if (nextMonthReadiness < 0) {
        const deferrableIds = [8, 9, 11, 13, 18];
        const candidates = deferrableIds.map(id => {
            const s = getCategoryStats(id);
            return { name: s.name, budget: Math.abs(s.budget) };
        }).sort((a, b) => b.budget - a.budget);
        let needed = Math.abs(nextMonthReadiness);
        for (const c of candidates) {
            if (needed <= 0) break;
            deferredBillsSuggestion.push(c.name);
            needed -= c.budget;
        }
        if (needed > 0) deferredBillsSuggestion.push("Emergency Income Needed");
    }

    const flexExpenses = db.prepare(`SELECT Amount, Date FROM Expense WHERE CategoryId IN (${dna.flexCategoryIds.join(',')}) AND Date LIKE ? AND Amount < 0`).all(currentMonth + '%') as { Amount: number, Date: string }[];
    const daySpending: Record<number, number> = {};
    flexExpenses.forEach(e => {
        const d = new Date(e.Date);
        const day = d.getDay();
        daySpending[day] = (daySpending[day] || 0) + Math.abs(e.Amount);
    });
    const totalFlex = flexExpenses.reduce((acc, e) => acc + Math.abs(e.Amount), 0);
    const weekendSpend = (daySpending[0] || 0) + (daySpending[6] || 0);

    let archetype: 'Weekend Leak' | 'Impulse Spike' | 'Steady' | 'None' = 'None';
    let highRiskDays: string[] = [];
    if (totalFlex > 500 && (weekendSpend / totalFlex) > 0.4) {
        archetype = 'Weekend Leak';
        highRiskDays = ['Saturday', 'Sunday'];
    }

    const currentMonthOverspend = ada < 0 ? Math.abs(ada * daysRemaining) : 0;
    const trend = currentMonthOverspend < deficitCarryOver ? 'improving' : 'worsening';

    const dailyDebtCapacity = totalDebtBudget / 30;
    const impactDays = dailyDebtCapacity > 0 ? Math.round(theftTotal / dailyDebtCapacity) : 0;

    const unknownStats = db.prepare(`SELECT Comment, COUNT(*) as count, SUM(ABS(Amount)) as total FROM Expense WHERE CategoryId = ? AND Date LIKE ? AND LENGTH(Comment) > 2 AND Comment NOT LIKE '...%' AND Comment != '.' GROUP BY Comment ORDER BY total DESC LIMIT 2`).all(dna.unknownCategoryId, currentMonth + '%') as { Comment: string, count: number, total: number }[];

    const combinedLeaks = [...leakDetails.map(l => ({ comment: l.comment, total: l.total })), ...unknownStats.map(u => ({ comment: u.Comment, total: u.total }))].sort((a, b) => b.total - a.total).slice(0, 3);

    let essentialSpent = 0;
    dna.essentialCategoryIds.forEach(id => { essentialSpent += getCategoryStats(id).spent; });
    let lifestyleSpent = 0;
    dna.lifestyleCategoryIds.forEach(id => { lifestyleSpent += getCategoryStats(id).spent; });

    const totalAllocated = essentialSpent + lifestyleSpent;
    const lifestyleRatio = totalAllocated > 0 ? (lifestyleSpent / totalAllocated) * 100 : 0;

    let grade = 'A';
    if (lifestyleRatio > 50) grade = 'C';
    else if (lifestyleRatio > 30) grade = 'B';
    if (ada < 0) grade = 'F';

    const adaStatus = isHardLocked || ada < 0 ? 'crisis' : ada < dna.adaThreshold ? 'warning' : 'optimal';

    return {
        ada,
        adaStatus,
        velocity: { timePct, moneyPct, status: velocityStatus },
        ironBuffer,
        theft: { total: theftTotal, impactDays, impactNarrative, dopamineSwap },
        unknowns: combinedLeaks.map(u => ({ comment: u.comment || 'Unlabeled', count: 0, total: u.total })),
        debt: debtItems,
        allocation: { essential: essentialSpent, lifestyle: lifestyleSpent, score: grade, ratio: lifestyleRatio, adaModifier: ada < 0, trend },
        freedom: { monthlyDebtTarget: totalDebtBudget, actualDebtPaid: totalDebtPaid, survivalNeutralDebt, sustainabilityScore },
        recovery: { deficitCarryOver, status: deficitCarryOver > 0 ? 'recovering' : 'neutral', monthsToRecover: Number(monthsToRecover.toFixed(1)), sensitivity: Number(sensitivity.toFixed(1)), recoveryTarget: dna.recoveryTargetIncome, recoveryBonus: Number(recoveryBonus.toFixed(2)) },
        revenue: { sideHustleEarned, nextBoostValue: Number((100 / daysRemaining).toFixed(2)) },
        ghostBuffer: { amount: ghostBufferAmount, rate: dna.volatilityReserveRate },
        liquidity: { status: liquidityStatus, cashRemaining: currentCashRemaining, ironRemaining: totalIronRemaining, coverageRatio, isHardLocked, bufferReboundPct: Math.max(-100, Math.min(100, coverageRatio)), nextMilestone, milestoneProgress: Number(milestoneProgress.toFixed(0)) },
        forecast: { nextMonthReadiness, status: nextMonthReadiness < 0 ? 'danger' : 'secure', deferredBillsSuggestion },
        behavior: { archetype, highRiskDays }
    };
}

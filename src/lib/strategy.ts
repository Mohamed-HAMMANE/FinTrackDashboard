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
        impactDays: number; // Days of debt payoff delayed
    };
    unknowns: {
        comment: string;
        count: number;
        total: number;
    }[];
    debt: {
        name: string;
        budget: number; // Monthly Target
        paid: number;
        // logic: if budget is the monthly payment, how much did we pay?
    }[];
    allocation: {
        essential: number;
        lifestyle: number;
        score: string; // Grade A-F
        ratio: number;
        adaModifier: boolean; // True if grade was capped by ADA < 0
        trend: 'improving' | 'worsening' | 'stable'; // V4 Trend
    };
    freedom: {
        monthlyDebtTarget: number; // Total budgeted for debt
        actualDebtPaid: number;
        survivalNeutralDebt: number; // The amount of debt we SHOULD have paid to keep ADA=0
        sustainabilityScore: number; // > 100% means sustainable, < 100% means over-servicing
    };
    // V2 New Metrics
    recovery: {
        deficitCarryOver: number;
        status: 'neutral' | 'recovering';
        monthsToRecover: number;
        sensitivity: number;
        recoveryTarget: number; // Added for UI transparency
    };
    revenue: {
        sideHustleEarned: number;
        nextBoostValue: number; // "One more mission increases daily spend by X"
    };
    ghostBuffer: {
        amount: number;
        rate: number;
    };
    // V3 New Metrics
    liquidity: {
        status: 'secure' | 'lockdown';
        cashRemaining: number;
        ironRemaining: number;
        coverageRatio: number; // Cash / Iron Remaining
    };
    // V4 New Metrics
    forecast: {
        nextMonthReadiness: number; // Predicted starting balance (Income - Deficit - Fixed)
        status: 'secure' | 'danger';
        deferredBillsSuggestion: string[];
    };
    behavior: {
        archetype: 'Weekend Leak' | 'Impulse Spike' | 'Steady' | 'None';
        highRiskDays: string[];
    };
    v5: {
        isHardLocked: boolean;
        impactNarrative: string;
        bufferReboundPct: number;
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

    // Helper to get category stats
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

    // 1. Calculate Aggregates
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

    // 2. V2 Logic: Persistence & Recovery

    // Feature: Deficit Carry-over (Prior Month Net)
    const lastMonthIncome = (db.prepare(`SELECT SUM(Amount) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(lastMonth + '%') as { total: number }).total || 0;
    const lastMonthExpense = (db.prepare(`SELECT SUM(ABS(Amount)) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(lastMonth + '%') as { total: number }).total || 0;
    const lastMonthNet = lastMonthIncome - lastMonthExpense;
    const deficitCarryOver = lastMonthNet < 0 ? Math.abs(lastMonthNet) : 0;

    // Feature: Ghost Buffer (Volatility Reserve)
    const ghostBufferAmount = monthlyIncome * dna.volatilityReserveRate;

    // Feature: Revenue Integration (Side Hustle)
    const sideHustleStats = getCategoryStats(dna.sideHustleCategoryId);
    const sideHustleEarned = sideHustleStats.earned; // Real-time injection

    // 3. Tactical Survival (ADA & Velocity)
    let totalDebtBudget = 0;
    dna.debtCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        totalDebtBudget += Math.abs(s.budget);
    });

    const debtItems = dna.debtCategoryIds.map(id => {
        const s = getCategoryStats(id);
        return {
            name: s.name,
            budget: Math.abs(s.budget),
            paid: s.spent
        };
    });
    const totalDebtPaid = debtItems.reduce((acc, d) => acc + d.paid, 0);

    const totalSpentToDate = totalFixedSpent + totalFlexSpent + totalDebtPaid;
    const currentCashRemaining = (monthlyIncome + sideHustleEarned) - totalSpentToDate;

    const liquidityStatus = currentCashRemaining < totalIronRemaining ? 'lockdown' : 'secure';
    const coverageRatio = totalIronRemaining > 0 ? (currentCashRemaining / totalIronRemaining) * 100 : 100;

    // ADA Calculation & Survival Ceiling (V5)
    const effectiveDisposable = (monthlyIncome + sideHustleEarned) - totalFixedBudget - totalDebtBudget - ghostBufferAmount - deficitCarryOver;
    let ada = (effectiveDisposable - totalFlexSpent) / daysRemaining;

    const isHardLocked = currentCashRemaining < totalIronRemaining;
    if (isHardLocked && ada > 0) {
        // Even if the math says we have ADA, if we don't have enough cash for base bills, 
        // we lock ADA to 0 for decision purposes.
        ada = 0;
    }

    // Velocity Sync
    const timePct = (dayOfMonth / daysInMonth) * 100;
    const moneyPct = totalFlexBudget > 0 ? (totalFlexSpent / totalFlexBudget) * 100 : 0;
    const velocityStatus = moneyPct > timePct ? 'behind' : 'ahead';

    // 4. Savings Erosion & Recovery
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

    // Sort leaks by severity
    leakDetails.sort((a, b) => b.total - a.total);

    const totalDeficit = deficitCarryOver + (ada < 0 ? Math.abs(ada * daysRemaining) : 0);
    const monthsToRecover = totalDeficit > 0 && dna.recoveryTargetIncome > 0
        ? (totalDeficit / dna.recoveryTargetIncome)
        : 0;

    const sensitivity = (100 / dna.recoveryTargetIncome) * 30;

    // V5 Dynamic Narrative
    const narratives = [
        `You could have paid for ${Math.floor(theftTotal / 1150)} months of School.`,
        `This waste is equal to ${Math.round(theftTotal / 45)} full days of healthy food.`,
        `This could have funded ${(theftTotal / 250).toFixed(1)} doctor visits.`,
        `You are trading your Future Security for temporary dopamine.`
    ];
    const impactNarrative = narratives[dayOfMonth % narratives.length];

    // V3: Survival Neutral Debt & Sustainability
    const resources = monthlyIncome + sideHustleEarned - ghostBufferAmount - deficitCarryOver;
    const survivalNeutralDebt = Math.max(0, resources - totalFixedBudget - totalFlexSpent);
    const sustainabilityScore = totalDebtPaid > 0 ? (survivalNeutralDebt / totalDebtPaid) * 100 : 100;

    // V4: Forecasting
    // Next Month Readiness = Income - (Projected Deficit + Fixed Bills)
    // Projected Deficit = current Total Deficit (CarryOver + Current Overspend)
    // This assumes we carry the FULL deficit into next month.
    const projectedDeficit = totalDeficit;

    // We assume Income for next month is same as Budget.
    // Fixed Bills for next month = totalFixedBudget (Total Budget for all Fixed items)
    // Actually, "Remaining Iron Bills" implies specific deferral. But for general readiness:
    // Available_Next_Month = Income - Deficit - Fixed_Budget.
    const nextMonthReadiness = monthlyIncome - projectedDeficit - totalFixedBudget;

    // Suggest Deferrals: If Readiness < 0, suggest from User-Approved Deferral List.
    // IDs: Car(8), Health(9), Me(11), Side Hustle(13), Unknown(18)
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

        // If we still need money and ran out of deferrable bills
        if (needed > 0) {
            deferredBillsSuggestion.push("Emergency Income Needed");
        }
    }

    // V4: Behavioral Archetype
    // Cluster Analysis: Get all Flex expenses and check accumulation by DayOfWeek.
    const flexExpenses = db.prepare(`
        SELECT Amount, Date FROM Expense 
        WHERE CategoryId IN (${dna.flexCategoryIds.join(',')}) 
        AND Date LIKE ?
        AND Amount < 0
    `).all(currentMonth + '%') as { Amount: number, Date: string }[];

    const daySpending: Record<number, number> = {}; // 0=Sun, 6=Sat
    flexExpenses.forEach(e => {
        const d = new Date(e.Date);
        const day = d.getDay();
        daySpending[day] = (daySpending[day] || 0) + Math.abs(e.Amount);
    });

    const weekendSpend = (daySpending[0] || 0) + (daySpending[6] || 0);
    const totalFlex = flexExpenses.reduce((acc, e) => acc + Math.abs(e.Amount), 0);
    const weekdaySpend = totalFlex - weekendSpend;

    let archetype: 'Weekend Leak' | 'Impulse Spike' | 'Steady' | 'None' = 'None';
    let highRiskDays: string[] = [];

    // Simple heuristic: If Weekend spend > 40% of total flex (and total is significant)
    if (totalFlex > 500 && (weekendSpend / totalFlex) > 0.4) {
        archetype = 'Weekend Leak';
        highRiskDays = ['Saturday', 'Sunday'];
    }

    // Impulse Spike Logic: Check for many txns in same day? For now sticking to Weekend Leak as primary V4 requirement.

    // V4: Trend Analysis
    // Constraint: Compare Current Month's "Bleed" vs Last Month's "Bleed" (Deficit).
    // If we are bleeding LESS this month than we did last month, we are improving.
    const currentMonthOverspend = ada < 0 ? Math.abs(ada * daysRemaining) : 0;
    const trend = currentMonthOverspend < deficitCarryOver ? 'improving' : 'worsening';


    // Opportunity Cost
    const dailyDebtCapacity = totalDebtBudget / 30;
    const impactDays = dailyDebtCapacity > 0 ? Math.round(theftTotal / dailyDebtCapacity) : 0;

    const unknownStats = db.prepare(`
        SELECT Comment, COUNT(*) as count, SUM(ABS(Amount)) as total
        FROM Expense 
        WHERE CategoryId = ? 
        AND Date LIKE ? 
        AND LENGTH(Comment) > 2
        AND Comment NOT LIKE '...%'
        AND Comment != '.'
        GROUP BY Comment ORDER BY total DESC LIMIT 2
    `).all(dna.unknownCategoryId, currentMonth + '%') as { Comment: string, count: number, total: number }[];

    // Combine Unknowns with overspent Flex categories for a cleaner "Leaks" HUD
    const combinedLeaks = [
        ...leakDetails.map(l => ({ comment: l.comment, total: l.total })),
        ...unknownStats.map(u => ({ comment: u.Comment, total: u.total }))
    ].sort((a, b) => b.total - a.total).slice(0, 3);

    // 5. Strategic Liabilities (Allocation & Grading)
    let essentialSpent = 0;
    dna.essentialCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        essentialSpent += s.spent;
    });

    let lifestyleSpent = 0;
    dna.lifestyleCategoryIds.forEach(id => {
        const s = getCategoryStats(id);
        lifestyleSpent += s.spent;
    });

    const totalAllocated = essentialSpent + lifestyleSpent;
    const lifestyleRatio = totalAllocated > 0 ? (lifestyleSpent / totalAllocated) * 100 : 0;

    // Grading V2: Liquidity-Weighted
    let grade = 'A';
    if (lifestyleRatio > 50) grade = 'C';
    else if (lifestyleRatio > 30) grade = 'B';

    let adaModifier = false;
    if (ada < 0) {
        grade = 'F';
        adaModifier = true;
    }

    return {
        ada,
        adaStatus: ada < dna.adaThreshold ? 'warning' : 'optimal',
        velocity: {
            timePct,
            moneyPct,
            status: velocityStatus
        },
        ironBuffer,
        theft: {
            total: theftTotal,
            impactDays
        },
        unknowns: combinedLeaks.map(u => ({ comment: u.comment || 'Unlabeled', count: 0, total: u.total })),
        debt: debtItems,
        allocation: {
            essential: essentialSpent,
            lifestyle: lifestyleSpent,
            score: grade,
            ratio: lifestyleRatio,
            adaModifier,
            trend
        },
        freedom: {
            monthlyDebtTarget: totalDebtBudget,
            actualDebtPaid: totalDebtPaid,
            survivalNeutralDebt,
            sustainabilityScore
        },
        recovery: {
            deficitCarryOver,
            status: deficitCarryOver > 0 ? 'recovering' : 'neutral',
            monthsToRecover: Number(monthsToRecover.toFixed(1)),
            sensitivity: Number(sensitivity.toFixed(1)),
            recoveryTarget: dna.recoveryTargetIncome
        },
        revenue: {
            sideHustleEarned,
            nextBoostValue: Number((100 / daysRemaining).toFixed(2))
        },
        ghostBuffer: {
            amount: ghostBufferAmount,
            rate: dna.volatilityReserveRate
        },
        liquidity: {
            status: liquidityStatus,
            cashRemaining: currentCashRemaining,
            ironRemaining: totalIronRemaining,
            coverageRatio
        },
        forecast: {
            nextMonthReadiness,
            status: nextMonthReadiness < 0 ? 'danger' : 'secure',
            deferredBillsSuggestion
        },
        behavior: {
            archetype,
            highRiskDays
        },
        v5: {
            isHardLocked,
            impactNarrative,
            bufferReboundPct: Math.max(-100, Math.min(100, coverageRatio))
        }
    };
}

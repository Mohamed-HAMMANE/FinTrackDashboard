import { db } from "@/lib/db";
import BudgetsClient from "./BudgetsClient";

export const dynamic = "force-dynamic";

export default function BudgetsPage() {
    const now = new Date();
    // Use local date for year-month string to avoid UTC shifts
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalBudget = (db.prepare('SELECT SUM(Budget) as total FROM Category').get() as { total: number }).total || 0;

    // Category breakdown
    const categories = db.prepare(`
        SELECT c.Id, c.Name as name, c.Budget as budget, COALESCE(SUM(ABS(e.Amount)), 0) as spent
        FROM Category c
        LEFT JOIN Expense e ON c.Id = e.CategoryId AND e.Date LIKE ? AND e.Amount < 0
        GROUP BY c.Id, c.Name, c.Budget
        ORDER BY c.[Order]
    `).all(currentMonth + '%') as any[];

    const budgetsWithProgress = categories.map(b => ({
        ...b,
        percentage: b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : 0,
        remaining: b.budget - b.spent
    }));

    // Historical Performance (last 6 months)
    const historicalData: { month: string; totalSpent: number; totalBudget: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const spent = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(m + '%') as { total: number }).total || 0;
        historicalData.push({
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            totalSpent: spent,
            totalBudget: totalBudget
        });
    }

    // Summary
    const currentSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetsWithProgress.filter(b => b.percentage > 100).length;
    const onTrackCount = budgetsWithProgress.filter(b => b.percentage <= 80 && b.budget > 0).length;

    return (
        <BudgetsClient
            budgets={budgetsWithProgress}
            historicalData={historicalData}
            totalBudget={totalBudget}
            currentSpent={currentSpent}
            overBudgetCount={overBudgetCount}
            onTrackCount={onTrackCount}
        />
    );
}

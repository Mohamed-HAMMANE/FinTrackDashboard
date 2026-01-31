import { db } from "@/lib/db";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
    const now = new Date();
    // Use local date for year-month string to avoid UTC shifts
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = now.getFullYear().toString();

    // Monthly summary
    const monthlyIncome = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(currentMonth + '%') as { total: number }).total || 0;
    const monthlyExpenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(currentMonth + '%') as { total: number }).total || 0;
    const monthlyTransactions = (db.prepare(`SELECT COUNT(*) as count FROM Expense WHERE Date LIKE ?`).get(currentMonth + '%') as { count: number }).count;

    // Yearly summary
    const yearlyIncome = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(currentYear + '%') as { total: number }).total || 0;
    const yearlyExpenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(currentYear + '%') as { total: number }).total || 0;
    const yearlyTransactions = (db.prepare(`SELECT COUNT(*) as count FROM Expense WHERE Date LIKE ?`).get(currentYear + '%') as { count: number }).count;

    // All-time summary
    const allTimeIncome = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Amount > 0`).get() as { total: number }).total || 0;
    const allTimeExpenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Amount < 0`).get() as { total: number }).total || 0;
    const allTimeTransactions = (db.prepare(`SELECT COUNT(*) as count FROM Expense`).get() as { count: number }).count;

    // Monthly breakdown for current year
    const monthlyBreakdown: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const income = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(m + '%') as { total: number }).total || 0;
        const expenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(m + '%') as { total: number }).total || 0;
        monthlyBreakdown.push({
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            income, expenses, net: income - expenses
        });
    }

    // Top expense categories this year
    const rawTopCategoriesYear = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as total, COUNT(*) as count
        FROM Expense e JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Date LIKE ? AND e.Amount < 0
        GROUP BY c.Name ORDER BY total DESC
    `).all(currentYear + '%') as { name: string; total: number; count: number }[];

    const topCategoriesYear: { name: string; total: number; count: number }[] = [];
    let yearlyOthersValue = 0;
    let yearlyOthersCount = 0;

    rawTopCategoriesYear.forEach(cat => {
        if (yearlyExpenses > 0 && (cat.total / yearlyExpenses) < 0.02) {
            yearlyOthersValue += cat.total;
            yearlyOthersCount += cat.count;
        } else {
            topCategoriesYear.push(cat);
        }
    });

    if (yearlyOthersValue > 0) {
        topCategoriesYear.push({ name: 'Others', total: yearlyOthersValue, count: yearlyOthersCount });
    }
    topCategoriesYear.sort((a, b) => b.total - a.total);

    // Biggest expenses this year
    const biggestExpenses = db.prepare(`
        SELECT e.*, c.Name as CategoryName FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Date LIKE ? AND e.Amount < 0
        ORDER BY ABS(e.Amount) DESC LIMIT 10
    `).all(currentYear + '%') as any[];

    return (
        <ReportsClient
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyTransactions={monthlyTransactions}
            yearlyIncome={yearlyIncome}
            yearlyExpenses={yearlyExpenses}
            yearlyTransactions={yearlyTransactions}
            allTimeIncome={allTimeIncome}
            allTimeExpenses={allTimeExpenses}
            allTimeTransactions={allTimeTransactions}
            monthlyBreakdown={monthlyBreakdown}
            topCategoriesYear={topCategoriesYear}
            biggestExpenses={biggestExpenses}
            currentMonth={now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            currentYear={currentYear}
        />
    );
}

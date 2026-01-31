import { db } from "@/lib/db";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
    const now = new Date();
    // Use local date for year-month string to avoid UTC shifts
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // Monthly spending for last 12 months
    const historicalData: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const income = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(m + '%') as { total: number }).total || 0;
        const expenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(m + '%') as { total: number }).total || 0;
        historicalData.push({
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            income, expenses, net: income - expenses
        });
    }

    // Category trends (current vs previous month)
    const currentCatSpend = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as amount FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id WHERE e.Date LIKE ? AND e.Amount < 0 GROUP BY c.Name ORDER BY amount DESC
    `).all(currentMonth + '%') as { name: string; amount: number }[];
    const lastCatSpend = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as amount FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id WHERE e.Date LIKE ? AND e.Amount < 0 GROUP BY c.Name
    `).all(lastMonth + '%') as { name: string; amount: number }[];
    const lastMap = new Map(lastCatSpend.map(c => [c.name, c.amount]));
    const categoryTrends = currentCatSpend.map(c => {
        const prev = lastMap.get(c.name) || 0;
        const change = prev > 0 ? Math.round(((c.amount - prev) / prev) * 100) : (c.amount > 0 ? 100 : 0);
        return { name: c.name, current: c.amount, previous: prev, change };
    });

    // Weekday pattern
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayData = db.prepare(`
        SELECT CAST(strftime('%w', Date) AS INTEGER) as day, SUM(ABS(Amount)) as amount, COUNT(*) as count
        FROM Expense WHERE Amount < 0 GROUP BY strftime('%w', Date)
    `).all() as { day: number; amount: number; count: number }[];
    const weekdayPattern = weekdayNames.map((name, i) => {
        const d = weekdayData.find(w => w.day === i);
        return { day: name, amount: d?.amount || 0, count: d?.count || 0 };
    });

    // Hourly pattern
    const hourlyData = db.prepare(`
        SELECT CAST(strftime('%H', CreationDate) AS INTEGER) as hour, SUM(ABS(Amount)) as amount, COUNT(*) as count
        FROM Expense WHERE Amount < 0 GROUP BY strftime('%H', CreationDate)
    `).all() as { hour: number; amount: number; count: number }[];
    const hourlyPattern = Array.from({ length: 24 }, (_, i) => {
        const h = hourlyData.find(d => d.hour === i);
        return { hour: i, amount: h?.amount || 0, count: h?.count || 0 };
    });

    // Top categories all time
    const topCategories = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as total, COUNT(*) as count
        FROM Expense e JOIN Category c ON e.CategoryId = c.Id WHERE e.Amount < 0
        GROUP BY c.Name ORDER BY total DESC LIMIT 10
    `).all() as { name: string; total: number; count: number }[];

    // Stats
    const totalTransactions = (db.prepare('SELECT COUNT(*) as count FROM Expense').get() as { count: number }).count;
    const avgTransaction = (db.prepare('SELECT AVG(ABS(Amount)) as avg FROM Expense WHERE Amount < 0').get() as { avg: number }).avg || 0;
    const maxExpense = (db.prepare('SELECT MAX(ABS(Amount)) as max FROM Expense WHERE Amount < 0').get() as { max: number }).max || 0;

    return (
        <AnalyticsClient
            monthlyData={historicalData}
            categoryTrends={categoryTrends}
            weekdayPattern={weekdayPattern}
            hourlyPattern={hourlyPattern}
            topCategories={topCategories}
            totalTransactions={totalTransactions}
            avgTransaction={avgTransaction}
            maxExpense={maxExpense}
        />
    );
}

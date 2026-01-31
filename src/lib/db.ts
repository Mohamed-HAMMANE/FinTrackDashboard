import 'server-only';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.db');

export const db = new Database(dbPath, {
    readonly: true,
    fileMustExist: true
});

// Types
export interface Expense {
    Id: number;
    Amount: number;
    Date: string;
    Comment: string;
    CreationDate: string;
    CategoryId: number;
    CategoryName?: string;
}

export interface CategoryBudget {
    name: string;
    budget: number;
    spent: number;
    percentage: number;
}

export interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
    net: number;
}

export interface WeekdaySpending {
    day: string;
    amount: number;
    count: number;
}

export interface CategoryTrend {
    name: string;
    current: number;
    previous: number;
    change: number;
}

export interface HourlyPattern {
    hour: number;
    amount: number;
    count: number;
}

export interface RunningBalance {
    date: string;
    balance: number;
}

export interface DashboardStats {
    // Core Stats
    totalBalance: number;
    monthlySpending: number;
    monthlyIncome: number;
    monthlyBudget: number;

    // Comparisons
    lastMonthSpending: number;
    spendingChange: number;
    dailyAverage: number;
    savingsRate: number;

    // Additional Metrics
    avgTransactionSize: number;
    transactionsThisMonth: number;
    daysWithSpending: number;
    projectedMonthlySpend: number;
    remainingBudget: number;
    largestExpense: number;
    totalIncome: number;
    totalExpenses: number;

    // Lists
    recentExpenses: Expense[];
    topExpenses: Expense[];
    spendingByCategory: { name: string; value: number }[];
    categoryBudgets: CategoryBudget[];

    // Trends
    spendingTrend: { date: string; amount: number }[];
    monthlyOverview: MonthlyData[];
    weekdayPattern: WeekdaySpending[];
    categoryTrends: CategoryTrend[];
    runningBalance: RunningBalance[];
    hourlyPattern: HourlyPattern[];

    // Metadata
    transactionCount: number;
    categoryCount: number;
    firstTransactionDate: string;
    daysSinceFirstTransaction: number;
}

export function getDashboardData(): DashboardStats {
    const now = new Date();
    // Use local date for year-month string to avoid UTC shifts
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Core Stats
    const totalBalance = (db.prepare('SELECT SUM(Amount) as total FROM Expense').get() as { total: number }).total || 0;

    const monthlySpendingRes = db.prepare(`
        SELECT SUM(ABS(Amount)) as total FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(currentMonth + '%') as { total: number };

    const monthlyIncomeRes = db.prepare(`
        SELECT SUM(Amount) as total FROM Expense WHERE Date LIKE ? AND Amount > 0
    `).get(currentMonth + '%') as { total: number };

    const lastMonthSpendingRes = db.prepare(`
        SELECT SUM(ABS(Amount)) as total FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(lastMonth + '%') as { total: number };

    const monthlyBudget = (db.prepare('SELECT SUM(Budget) as total FROM Category').get() as { total: number }).total || 0;

    // Transactions this month
    const transactionsThisMonth = (db.prepare(`
        SELECT COUNT(*) as count FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(currentMonth + '%') as { count: number }).count;

    // Days with spending this month
    const daysWithSpending = (db.prepare(`
        SELECT COUNT(DISTINCT SUBSTR(Date, 1, 10)) as count FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(currentMonth + '%') as { count: number }).count;

    // Average transaction size this month
    const avgTransactionRes = db.prepare(`
        SELECT AVG(ABS(Amount)) as avg FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(currentMonth + '%') as { avg: number };

    // Largest expense this month
    const largestExpenseRes = db.prepare(`
        SELECT MAX(ABS(Amount)) as max FROM Expense WHERE Date LIKE ? AND Amount < 0
    `).get(currentMonth + '%') as { max: number };

    // Total income/expenses all time
    const totalIncome = (db.prepare('SELECT SUM(Amount) as total FROM Expense WHERE Amount > 0').get() as { total: number }).total || 0;
    const totalExpenses = (db.prepare('SELECT SUM(ABS(Amount)) as total FROM Expense WHERE Amount < 0').get() as { total: number }).total || 0;

    // Recent & Top Expenses
    const recentExpenses = db.prepare(`
        SELECT e.*, c.Name as CategoryName FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id ORDER BY e.Date DESC, e.CreationDate DESC LIMIT 12
    `).all() as Expense[];

    const topExpenses = db.prepare(`
        SELECT e.*, c.Name as CategoryName FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Date LIKE ? AND e.Amount < 0 ORDER BY ABS(e.Amount) DESC LIMIT 5
    `).all(currentMonth + '%') as Expense[];

    // Spending by Category
    const rawSpendingByCategory = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as value FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Date LIKE ? AND e.Amount < 0 GROUP BY c.Name ORDER BY value DESC
    `).all(currentMonth + '%') as { name: string; value: number }[];

    const totalCurrentSpending = (monthlySpendingRes.total || 0);
    const spendingByCategory: { name: string; value: number }[] = [];
    let othersValue = 0;

    rawSpendingByCategory.forEach(cat => {
        if (totalCurrentSpending > 0 && (cat.value / totalCurrentSpending) < 0.02) {
            othersValue += cat.value;
        } else {
            spendingByCategory.push(cat);
        }
    });

    if (othersValue > 0) {
        spendingByCategory.push({ name: 'Others', value: othersValue });
    }
    spendingByCategory.sort((a, b) => b.value - a.value);

    // Category Budgets
    const categoryBudgets = db.prepare(`
        SELECT c.Name as name, c.Budget as budget, COALESCE(SUM(ABS(e.Amount)), 0) as spent
        FROM Category c LEFT JOIN Expense e ON c.Id = e.CategoryId AND e.Date LIKE ? AND e.Amount < 0
        GROUP BY c.Id, c.Name, c.Budget ORDER BY c.[Order]
    `).all(currentMonth + '%') as { name: string; budget: number; spent: number }[];

    const categoryBudgetsWithPercentage = categoryBudgets.map(c => ({
        ...c, percentage: c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
    }));

    // Spending Trend (last 30 days)
    const spendingTrend = db.prepare(`
        SELECT SUBSTR(Date, 1, 10) as date, SUM(ABS(Amount)) as amount FROM Expense
        WHERE Amount < 0 GROUP BY SUBSTR(Date, 1, 10) ORDER BY date DESC LIMIT 30
    `).all().reverse() as { date: string; amount: number }[];

    // Running Balance (last 30 days)
    const allExpenses = db.prepare(`
        SELECT SUBSTR(Date, 1, 10) as date, SUM(Amount) as amount FROM Expense
        GROUP BY SUBSTR(Date, 1, 10) ORDER BY date
    `).all() as { date: string; amount: number }[];

    let runningTotal = 0;
    const runningBalance: RunningBalance[] = allExpenses.slice(-30).map(e => {
        runningTotal += e.amount;
        return { date: e.date, balance: runningTotal };
    });

    // Monthly Overview (6 months)
    const monthlyOverview: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const income = (db.prepare(`SELECT COALESCE(SUM(Amount), 0) as total FROM Expense WHERE Date LIKE ? AND Amount > 0`).get(monthStr + '%') as { total: number }).total || 0;
        const expenses = (db.prepare(`SELECT COALESCE(SUM(ABS(Amount)), 0) as total FROM Expense WHERE Date LIKE ? AND Amount < 0`).get(monthStr + '%') as { total: number }).total || 0;
        monthlyOverview.push({
            month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
            income, expenses, net: income - expenses
        });
    }

    // Weekday Pattern
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayPattern: WeekdaySpending[] = weekdayNames.map(day => ({ day, amount: 0, count: 0 }));
    const weekdayData = db.prepare(`
        SELECT CAST(strftime('%w', Date) AS INTEGER) as dayNum, SUM(ABS(Amount)) as amount, COUNT(*) as count
        FROM Expense WHERE Amount < 0 GROUP BY strftime('%w', Date)
    `).all() as { dayNum: number; amount: number; count: number }[];
    weekdayData.forEach(d => { weekdayPattern[d.dayNum] = { day: weekdayNames[d.dayNum], amount: d.amount, count: d.count }; });

    // Hourly Pattern
    const hourlyPattern: HourlyPattern[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, amount: 0, count: 0 }));
    const hourlyData = db.prepare(`
        SELECT CAST(strftime('%H', CreationDate) AS INTEGER) as hour, SUM(ABS(Amount)) as amount, COUNT(*) as count
        FROM Expense WHERE Amount < 0 GROUP BY strftime('%H', CreationDate)
    `).all() as { hour: number; amount: number; count: number }[];
    hourlyData.forEach(h => { hourlyPattern[h.hour] = { hour: h.hour, amount: h.amount, count: h.count }; });

    // Category Trends (this vs last month)
    const categoryTrends: CategoryTrend[] = [];
    const currentCatSpend = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as amount FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id WHERE e.Date LIKE ? AND e.Amount < 0 GROUP BY c.Name
    `).all(currentMonth + '%') as { name: string; amount: number }[];
    const lastCatSpend = db.prepare(`
        SELECT c.Name as name, SUM(ABS(e.Amount)) as amount FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id WHERE e.Date LIKE ? AND e.Amount < 0 GROUP BY c.Name
    `).all(lastMonth + '%') as { name: string; amount: number }[];

    const lastMap = new Map(lastCatSpend.map(c => [c.name, c.amount]));
    currentCatSpend.forEach(c => {
        const prev = lastMap.get(c.name) || 0;
        const change = prev > 0 ? Math.round(((c.amount - prev) / prev) * 100) : 0;
        categoryTrends.push({ name: c.name, current: c.amount, previous: prev, change });
    });
    categoryTrends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    // Metadata
    const transactionCount = (db.prepare('SELECT COUNT(*) as count FROM Expense').get() as { count: number }).count;
    const categoryCount = (db.prepare('SELECT COUNT(*) as count FROM Category').get() as { count: number }).count;
    const firstTx = db.prepare('SELECT MIN(Date) as date FROM Expense').get() as { date: string };
    const firstTransactionDate = firstTx.date || now.toISOString();
    const daysSinceFirstTransaction = Math.floor((now.getTime() - new Date(firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24));

    // Calculations
    const monthlySpending = monthlySpendingRes.total || 0;
    const monthlyIncome = monthlyIncomeRes.total || 0;
    const lastMonthSpending = lastMonthSpendingRes.total || 0;
    const spendingChange = lastMonthSpending > 0 ? Math.round(((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100) : 0;
    const dailyAverage = dayOfMonth > 0 ? Math.round(monthlySpending / dayOfMonth) : 0;
    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlySpending) / monthlyIncome) * 100) : 0;
    const projectedMonthlySpend = dayOfMonth > 0 ? Math.round((monthlySpending / dayOfMonth) * daysInMonth) : 0;
    const remainingBudget = monthlyBudget - monthlySpending;

    return {
        totalBalance, monthlySpending, monthlyIncome, monthlyBudget,
        lastMonthSpending, spendingChange, dailyAverage, savingsRate,
        avgTransactionSize: avgTransactionRes.avg || 0,
        transactionsThisMonth, daysWithSpending, projectedMonthlySpend, remainingBudget,
        largestExpense: largestExpenseRes.max || 0,
        totalIncome, totalExpenses,
        recentExpenses, topExpenses, spendingByCategory, categoryBudgets: categoryBudgetsWithPercentage,
        spendingTrend, monthlyOverview, weekdayPattern, categoryTrends, runningBalance, hourlyPattern,
        transactionCount, categoryCount, firstTransactionDate, daysSinceFirstTransaction
    };
}

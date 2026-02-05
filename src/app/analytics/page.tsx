import { db } from "@/lib/db";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

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

    // Regime shift detector (no prediction; recent behavior vs baseline)
    const recentDays = 14;
    const baselineDays = 56;
    const chartDays = 90;

    const startChart = new Date(now);
    startChart.setDate(now.getDate() - (chartDays - 1));
    const startChartYMD = formatYMD(startChart);

    const dailyRaw = db.prepare(`
        SELECT SUBSTR(Date, 1, 10) as day, SUM(ABS(Amount)) as total
        FROM Expense
        WHERE Amount < 0 AND SUBSTR(Date, 1, 10) >= ?
        GROUP BY SUBSTR(Date, 1, 10)
        ORDER BY day
    `).all(startChartYMD) as { day: string; total: number }[];

    const dailyMap = new Map(dailyRaw.map(r => [r.day, r.total || 0]));
    const dailySpend: { date: string; amount: number; rolling7: number }[] = [];
    for (let i = 0; i < chartDays; i++) {
        const d = new Date(startChart);
        d.setDate(startChart.getDate() + i);
        const key = formatYMD(d);
        dailySpend.push({ date: key, amount: dailyMap.get(key) || 0, rolling7: 0 });
    }
    for (let i = 0; i < dailySpend.length; i++) {
        const from = Math.max(0, i - 6);
        let acc = 0;
        for (let j = from; j <= i; j++) acc += dailySpend[j].amount;
        dailySpend[i].rolling7 = acc / (i - from + 1);
    }

    const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const baselineSlice = dailySpend.slice(Math.max(0, dailySpend.length - recentDays - baselineDays), Math.max(0, dailySpend.length - recentDays));
    const recentSlice = dailySpend.slice(Math.max(0, dailySpend.length - recentDays));
    const baselineAvg = mean(baselineSlice.map(d => d.amount));
    const recentAvg = mean(recentSlice.map(d => d.amount));
    const changePct = baselineAvg > 0 ? ((recentAvg - baselineAvg) / baselineAvg) * 100 : 0;

    const shiftThresholdPct = 25;
    const detected = baselineAvg > 0 && Math.abs(changePct) >= shiftThresholdPct;
    const rising = recentAvg >= baselineAvg;
    const target = baselineAvg * (1 + (rising ? shiftThresholdPct : -shiftThresholdPct) / 100);

    let shiftStartDate: string | null = null;
    if (detected) {
        const scanFrom = Math.max(0, dailySpend.length - 45);
        for (let i = scanFrom; i < dailySpend.length; i++) {
            const v = dailySpend[i].rolling7;
            if ((rising && v >= target) || (!rising && v <= target)) {
                shiftStartDate = dailySpend[i].date;
                break;
            }
        }
    }

    const baselineStart = new Date(now);
    baselineStart.setDate(now.getDate() - (recentDays + baselineDays - 1));
    const recentStart = new Date(now);
    recentStart.setDate(now.getDate() - (recentDays - 1));
    const baselineStartYMD = formatYMD(baselineStart);
    const recentStartYMD = formatYMD(recentStart);

    const driverRows = db.prepare(`
        SELECT c.Name as name,
               SUM(CASE WHEN SUBSTR(e.Date, 1, 10) >= ? AND SUBSTR(e.Date, 1, 10) < ? THEN ABS(e.Amount) ELSE 0 END) as baselineTotal,
               SUM(CASE WHEN SUBSTR(e.Date, 1, 10) >= ? THEN ABS(e.Amount) ELSE 0 END) as recentTotal
        FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Amount < 0 AND SUBSTR(e.Date, 1, 10) >= ?
        GROUP BY c.Name
    `).all(baselineStartYMD, recentStartYMD, recentStartYMD, baselineStartYMD) as { name: string; baselineTotal: number; recentTotal: number }[];

    const drivers = driverRows
        .map(r => {
            const baselinePerDay = (r.baselineTotal || 0) / baselineDays;
            const recentPerDay = (r.recentTotal || 0) / recentDays;
            return {
                name: r.name,
                baselinePerDay,
                recentPerDay,
                deltaPerDay: recentPerDay - baselinePerDay
            };
        })
        .filter(r => Math.abs(r.deltaPerDay) > 0.01)
        .sort((a, b) => Math.abs(b.deltaPerDay) - Math.abs(a.deltaPerDay))
        .slice(0, 6);

    const start120 = new Date(now);
    start120.setDate(now.getDate() - 119);
    const start120YMD = formatYMD(start120);
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 29);
    const last30YMD = formatYMD(last30);

    const newRecurring = db.prepare(`
        SELECT c.Name as category,
               TRIM(e.Comment) as comment,
               SUM(CASE WHEN SUBSTR(e.Date, 1, 10) >= ? THEN 1 ELSE 0 END) as recentCount,
               SUM(CASE WHEN SUBSTR(e.Date, 1, 10) >= ? THEN ABS(e.Amount) ELSE 0 END) as recentTotal,
               SUM(CASE WHEN SUBSTR(e.Date, 1, 10) < ? THEN 1 ELSE 0 END) as priorCount,
               MIN(SUBSTR(e.Date, 1, 10)) as firstSeen
        FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        WHERE e.Amount < 0
          AND e.Comment IS NOT NULL
          AND TRIM(e.Comment) != ''
          AND LENGTH(TRIM(e.Comment)) > 1
          AND SUBSTR(e.Date, 1, 10) >= ?
        GROUP BY e.CategoryId, TRIM(e.Comment)
        HAVING recentCount >= 3 AND priorCount = 0
        ORDER BY recentTotal DESC
        LIMIT 6
    `).all(last30YMD, last30YMD, last30YMD, start120YMD) as { category: string; comment: string; recentCount: number; recentTotal: number; firstSeen: string }[];

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
            regime={{
                dailySpend,
                detected,
                rising,
                shiftStartDate,
                baselineAvg,
                recentAvg,
                changePct,
                drivers,
                newRecurring
            }}
        />
    );
}

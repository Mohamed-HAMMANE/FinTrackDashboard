import { db } from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

interface CategoryRow {
    Id: number;
    Name: string;
    Budget: number;
}

interface NoteRow {
    id: number;
    comment: string;
    expTotal: number;
    incTotal: number;
    expCount: number;
    incCount: number;
    months: number;
}

const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export default function CategoriesPage() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const categories = db.prepare(`
        SELECT Id, Name, Budget FROM Category ORDER BY [Order]
    `).all() as CategoryRow[];

    const months = Array.from({ length: 36 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (35 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return { key, label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }) };
    });

    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        return {
            key: formatYMD(d),
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        };
    });
    const mtdRows = db.prepare(`
        SELECT CategoryId as id,
               SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expTotal,
               SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as incTotal,
               COUNT(CASE WHEN Amount < 0 THEN 1 END) as expCount,
               COUNT(CASE WHEN Amount > 0 THEN 1 END) as incCount
        FROM Expense
        WHERE Date LIKE ?
        GROUP BY CategoryId
    `).all(currentMonth + "%") as { id: number; expTotal: number; incTotal: number; expCount: number; incCount: number }[];

    const allRows = db.prepare(`
        SELECT CategoryId as id,
               SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expTotal,
               SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as incTotal,
               COUNT(CASE WHEN Amount < 0 THEN 1 END) as expCount,
               COUNT(CASE WHEN Amount > 0 THEN 1 END) as incCount,
               AVG(CASE WHEN Amount < 0 THEN ABS(Amount) END) as expAvg,
               AVG(CASE WHEN Amount > 0 THEN Amount END) as incAvg,
               MAX(CASE WHEN Amount < 0 THEN ABS(Amount) END) as expMax,
               MAX(CASE WHEN Amount > 0 THEN Amount END) as incMax,
               COUNT(DISTINCT CASE WHEN Amount < 0 THEN SUBSTR(Date, 1, 7) END) as expMonths,
               COUNT(DISTINCT CASE WHEN Amount > 0 THEN SUBSTR(Date, 1, 7) END) as incMonths,
               COUNT(DISTINCT SUBSTR(Date, 1, 7)) as activeMonths
        FROM Expense
        GROUP BY CategoryId
    `).all() as {
        id: number;
        expTotal: number;
        incTotal: number;
        expCount: number;
        incCount: number;
        expAvg: number;
        incAvg: number;
        expMax: number;
        incMax: number;
        expMonths: number;
        incMonths: number;
        activeMonths: number;
    }[];

    const startMonth = `${months[0].key}-01`;
    const monthlyRows = db.prepare(`
        SELECT CategoryId as id,
               SUBSTR(Date, 1, 7) as ym,
               SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expTotal,
               SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as incTotal
        FROM Expense
        WHERE Date >= ?
        GROUP BY CategoryId, ym
    `).all(startMonth) as { id: number; ym: string; expTotal: number; incTotal: number }[];

    const startDay = days[0]?.key || formatYMD(now);
    const dailyRows = db.prepare(`
        SELECT CategoryId as id,
               SUBSTR(Date, 1, 10) as day,
               SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expTotal,
               SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as incTotal
        FROM Expense
        WHERE Date >= ?
        GROUP BY CategoryId, day
    `).all(startDay) as { id: number; day: string; expTotal: number; incTotal: number }[];

    const noteRows = db.prepare(`
        SELECT CategoryId as id,
               Comment as comment,
               SUM(CASE WHEN Amount < 0 THEN ABS(Amount) ELSE 0 END) as expTotal,
               SUM(CASE WHEN Amount > 0 THEN Amount ELSE 0 END) as incTotal,
               COUNT(CASE WHEN Amount < 0 THEN 1 END) as expCount,
               COUNT(CASE WHEN Amount > 0 THEN 1 END) as incCount,
               COUNT(DISTINCT SUBSTR(Date, 1, 7)) as months
        FROM Expense
        WHERE Comment IS NOT NULL AND TRIM(Comment) != '' AND LENGTH(Comment) > 1
        GROUP BY CategoryId, Comment
    `).all() as NoteRow[];

    const mtdMap = new Map(mtdRows.map(r => [r.id, r]));
    const allMap = new Map(allRows.map(r => [r.id, r]));

    const monthlyMap = new Map<number, Map<string, { exp: number; inc: number }>>();
    monthlyRows.forEach(r => {
        if (!monthlyMap.has(r.id)) monthlyMap.set(r.id, new Map());
        monthlyMap.get(r.id)!.set(r.ym, { exp: r.expTotal || 0, inc: r.incTotal || 0 });
    });

    const dailyMap = new Map<number, Map<string, { exp: number; inc: number }>>();
    dailyRows.forEach(r => {
        if (!dailyMap.has(r.id)) dailyMap.set(r.id, new Map());
        dailyMap.get(r.id)!.set(r.day, { exp: r.expTotal || 0, inc: r.incTotal || 0 });
    });

    const notesMap = new Map<number, { income: NoteRow[]; expense: NoteRow[] }>();
    noteRows.forEach(r => {
        if (!notesMap.has(r.id)) notesMap.set(r.id, { income: [], expense: [] });
        if (r.incTotal > 0) notesMap.get(r.id)!.income.push(r);
        if (r.expTotal > 0) notesMap.get(r.id)!.expense.push(r);
    });
    notesMap.forEach(v => {
        v.income.sort((a, b) => b.incTotal - a.incTotal);
        v.expense.sort((a, b) => b.expTotal - a.expTotal);
        v.income = v.income.slice(0, 6);
        v.expense = v.expense.slice(0, 6);
    });

    const categoryData = categories.map(cat => {
        const mtd = mtdMap.get(cat.Id);
        const all = allMap.get(cat.Id);
        const expTotal = all?.expTotal || 0;
        const incTotal = all?.incTotal || 0;
        const activeMonths = all?.activeMonths || 0;
        const avgExpensePerMonth = activeMonths > 0 ? expTotal / activeMonths : 0;
        const avgIncomePerMonth = activeMonths > 0 ? incTotal / activeMonths : 0;
        const avgNetPerMonth = activeMonths > 0 ? (incTotal - expTotal) / activeMonths : 0;
        const monthlySeries = months.map(m => ({
            key: m.key,
            month: m.label,
            income: monthlyMap.get(cat.Id)?.get(m.key)?.inc || 0,
            expense: monthlyMap.get(cat.Id)?.get(m.key)?.exp || 0,
            net: (monthlyMap.get(cat.Id)?.get(m.key)?.inc || 0) - (monthlyMap.get(cat.Id)?.get(m.key)?.exp || 0)
        }));
        const dailySeries = days.map(d => ({
            date: d.label,
            income: dailyMap.get(cat.Id)?.get(d.key)?.inc || 0,
            expense: dailyMap.get(cat.Id)?.get(d.key)?.exp || 0,
            net: (dailyMap.get(cat.Id)?.get(d.key)?.inc || 0) - (dailyMap.get(cat.Id)?.get(d.key)?.exp || 0)
        }));
        const notes = notesMap.get(cat.Id) || { income: [], expense: [] };
        return {
            id: cat.Id,
            name: cat.Name,
            budget: cat.Budget || 0,
            mtdIncome: mtd?.incTotal || 0,
            mtdExpense: mtd?.expTotal || 0,
            mtdIncomeCount: mtd?.incCount || 0,
            mtdExpenseCount: mtd?.expCount || 0,
            totalIncome: incTotal,
            totalExpense: expTotal,
            totalIncomeCount: all?.incCount || 0,
            totalExpenseCount: all?.expCount || 0,
            avgIncomeTxn: all?.incAvg || 0,
            avgExpenseTxn: all?.expAvg || 0,
            maxIncomeTxn: all?.incMax || 0,
            maxExpenseTxn: all?.expMax || 0,
            avgIncomePerMonth,
            avgExpensePerMonth,
            avgNetPerMonth,
            activeMonths,
            monthlySeries,
            dailySeries,
            topIncomeNotes: notes.income.map(n => ({ comment: n.comment, total: n.incTotal, count: n.incCount, months: n.months })),
            topExpenseNotes: notes.expense.map(n => ({ comment: n.comment, total: n.expTotal, count: n.expCount, months: n.months }))
        };
    });

    return <CategoriesClient categories={categories} data={categoryData} />;
}

import { db } from "@/lib/db";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

interface Expense {
    Id: number;
    Amount: number;
    Date: string;
    CreationDate: string;
    Comment: string;
    CategoryId: number;
    CategoryName: string;
}

interface Category {
    Id: number;
    Name: string;
}

export default function TransactionsPage() {
    // Fetch all transactions
    const transactions = db.prepare(`
        SELECT e.*, c.Name as CategoryName 
        FROM Expense e
        JOIN Category c ON e.CategoryId = c.Id
        ORDER BY e.Date DESC, e.CreationDate DESC
    `).all() as Expense[];

    // Fetch categories for filter
    const categories = db.prepare('SELECT Id, Name FROM Category ORDER BY [Order]').all() as Category[];

    // Stats
    const totalIncome = transactions.filter(t => t.Amount > 0).reduce((sum, t) => sum + t.Amount, 0);
    const totalExpenses = transactions.filter(t => t.Amount < 0).reduce((sum, t) => sum + Math.abs(t.Amount), 0);

    return (
        <TransactionsClient
            transactions={transactions}
            categories={categories}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
        />
    );
}

"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
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

interface Props {
    transactions: Transaction[];
    categories: Category[];
    totalIncome: number;
    totalExpenses: number;
}

export default function TransactionsClient({ transactions, categories, totalIncome, totalExpenses }: Props) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
    const [sortBy, setSortBy] = useState<"date" | "amount">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const perPage = 15;

    const { filtered, filteredIncome, filteredExpenses } = useMemo(() => {
        const filteredList = transactions.filter(t => {
            const matchesSearch = !search ||
                t.Comment?.toLowerCase().includes(search.toLowerCase()) ||
                t.CategoryName.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === "all" || t.CategoryName === categoryFilter;
            const matchesType = typeFilter === "all" ||
                (typeFilter === "income" && t.Amount > 0) ||
                (typeFilter === "expense" && t.Amount < 0);
            return matchesSearch && matchesCategory && matchesType;
        }).sort((a, b) => {
            const dir = sortOrder === "asc" ? 1 : -1;
            if (sortBy === "date") {
                const dateDiff = new Date(a.Date).getTime() - new Date(b.Date).getTime();
                if (dateDiff !== 0) return dir * dateDiff;
                return dir * (new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime());
            }
            return dir * (Math.abs(a.Amount) - Math.abs(b.Amount));
        });

        let income = 0;
        let expenses = 0;
        filteredList.forEach(t => {
            if (t.Amount > 0) income += t.Amount;
            else expenses += t.Amount;
        });

        return { filtered: filteredList, filteredIncome: income, filteredExpenses: expenses };
    }, [transactions, search, categoryFilter, typeFilter, sortBy, sortOrder]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const toggleSort = (field: "date" | "amount") => {
        if (sortBy === field) {
            setSortOrder(o => o === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Transactions</h1>
                    <p className="text-[var(--foreground-muted)] mt-1">View and filter all your financial transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="badge badge-success">
                        <TrendingUp className="w-3 h-3 mr-1.5" />
                        {formatCurrency(totalIncome)} income
                    </div>
                    <div className="badge badge-danger">
                        <TrendingDown className="w-3 h-3 mr-1.5" />
                        {formatCurrency(totalExpenses)} expenses
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="input w-auto min-w-[150px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.Id} value={c.Name}>{c.Name}</option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
                        className="input w-auto min-w-[120px]"
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expenses</option>
                    </select>

                    <div className="flex flex-wrap items-center gap-3 text-sm ml-auto">
                        <span className="text-[var(--foreground-muted)] whitespace-nowrap">{filtered.length} results</span>
                        <div className="h-4 w-px bg-[var(--glass-border)] hidden sm:block" />
                        <div className="flex items-center gap-4">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {formatCurrency(filteredIncome)}
                            </span>
                            <span className="text-red-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {formatCurrency(Math.abs(filteredExpenses))}
                            </span>
                            <span className={`font-bold px-2 py-0.5 rounded-md bg-white/5 whitespace-nowrap ${(filteredIncome + filteredExpenses) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                Net: {formatCurrency(filteredIncome + filteredExpenses)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th
                                    className="cursor-pointer hover:text-[var(--foreground)]"
                                    onClick={() => toggleSort("date")}
                                >
                                    <span className="flex items-center gap-2">
                                        Date
                                        <ArrowUpDown className="w-3 h-3" />
                                    </span>
                                </th>
                                <th>Category</th>
                                <th>Description</th>
                                <th
                                    className="text-right cursor-pointer hover:text-[var(--foreground)]"
                                    onClick={() => toggleSort("amount")}
                                >
                                    <span className="flex items-center justify-end gap-2">
                                        Amount
                                        <ArrowUpDown className="w-3 h-3" />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(t => (
                                <tr key={t.Id} className="group/row transition-colors hover:bg-white/[0.02]">
                                    <td className="text-[var(--foreground)] opacity-70 group-hover/row:opacity-100 transition-opacity">
                                        {new Date(t.Date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40 group-hover/row:opacity-100 group-hover/row:scale-125 transition-all" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] group-hover/row:text-indigo-300 transition-colors">{t.CategoryName}</span>
                                        </div>
                                    </td>
                                    <td className="max-w-xs truncate text-[var(--foreground-muted)] group-hover/row:text-[var(--foreground)] transition-colors">
                                        {t.Comment || "—"}
                                    </td>
                                    <td className={`text-right font-black tabular-nums ${t.Amount < 0 ? 'text-red-400/80 group-hover/row:text-red-400' : 'text-emerald-400/80 group-hover/row:text-emerald-400'} transition-colors`}>
                                        {formatCurrency(t.Amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--glass-border)]">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-ghost disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-[var(--foreground)]">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn btn-ghost disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

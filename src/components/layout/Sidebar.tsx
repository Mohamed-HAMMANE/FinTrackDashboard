"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Receipt, BarChart3, Target, FileText,
    Wallet, Shield, Layers
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/decision", label: "Command Center", icon: Shield },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: Layers },
    { href: "/budgets", label: "Budgets", icon: Target },
    { href: "/reports", label: "Reports", icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar fixed left-0 top-0 h-full z-50 flex flex-col w-[260px]">
            {/* Logo */}
            <div className="flex items-center gap-3 p-5 border-b border-[var(--glass-border)]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold gradient-text">FinTrack</h1>
                    <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Analytics</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3 px-3">
                    Menu
                </p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item ${isActive ? "active" : ""}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[var(--glass-border)]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-bg)]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">User</p>
                        <p className="text-xs text-[var(--foreground-muted)]">Personal Account</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

# 💎 FinTrack Dashboard: Tactical Command Center

A premium, glassmorphic financial strategist and analytics dashboard built with **Next.js 16**, **SQLite**, and **Tailwind CSS 4**. This isn't just a tracker—it's an autonomous strategist designed to enforce financial discipline through survival metrics and gamification.

## 🚀 Key Features

### 1. Tactical Command Center (Strategist)
- **ADA (Adjusted Daily Allowance)**: The heart of the strategist. Calculates exactly how much you can spend *today* based on income, fixed bills, debt, and survival reserves.
- **Liquidity Lockdown**: Automatic "Red Alert" system that triggers if current cash drops below upcoming "Iron Bills" (mandatory obligations).
- **Insolvency Exit (V6)**: Gamified recovery tracking with 500 DH milestones and "Dopamine Swap" suggestions to replace expensive habits with free activities.
- **Capital Theft Tracking**: Visualizes how much "Flex" overspending has been "stolen" from your future freedom.

### 2. Local Android Sync API
- **Direct App Link**: Built-in ingestion layer for the companion Android app.
- **Push Synchronization**: Sync your mobile database over your local network using the secure `/api/sync` endpoint.
- **Status HUD**: Real-time "Last Sync" indicator and live data pulse on the main dashboard.

### 3. Analytics & Visualization
- **Spending Trend**: High-density timeline of the last 30 days with automated date formatting and clean tooltips.
- **Budget Status Gauge**: Premium radial progress charts for monthly spending vs. category limits.
- **Cash Flow Overview**: 6-month historical comparison of Income, Expenses, and Net Profit.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via `better-sqlite3` (Read-Write support enabled)
- **Styling**: Tailwind CSS v4 + Premium Glassmorphism V2
- **Icons**: Lucide React
- **Standardization**: Unified StrategicMetrics API (Production Ready)

## 📋 Getting Started

### Installation

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Sync Key Setup**:
   Create a `.env.local` file and add a secret key for your phone to sync:
   ```env
   SYNC_API_KEY=your_secret_key_here
   ```

### Hosting (Production Mode)

For the best performance and background hosting on your laptop:

```bash
# Build the optimized application
npm run build

# Start the high-performance server
npm run start
```

### 📱 Android Sync Setup
Point your Android app's sync feature to:
- **URL**: `http://YOUR_LOCAL_IP:3000/api/sync`
- **Method**: `POST`
- **Header**: `x-api-key: your_secret_key_here`

---
Built with ❤️ for precision financial survival and freedom.

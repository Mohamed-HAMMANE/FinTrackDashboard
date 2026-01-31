# 💎 FinTrack Dashboard

A premium, glassmorphic personal finance tracker built with **Next.js**, **SQLite**, and **Recharts**. Track your spending, manage budgets, and visualize your financial health with a state-of-the-art interface.

![Dashboard Preview](public/dashboard_preview.png) *(Note: Add your own screenshot here)*

## 🚀 Features

- **Dynamic Dashboard**: Real-time stats with animated counters and neon-glow spending trends.
- **Budget Management**: Premium circular gauges with tracking for over-budget and on-track categories.
- **Deep Analytics**: Visualization of spending patterns by day, hour, and category.
- **Comprehensive Reports**: Monthly, Yearly, and All-Time financial breakdowns.
- **Transaction Tracking**: Powerful filtering, searching, and real-time sum summaries.
- **Premium UI**: Dark-mode first design featuring glassmorphism, smooth animations, and tailored HSL color palettes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [SQLite](https://sqlite.org/) via `better-sqlite3`
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Tailwind CSS & Vanilla CSS (Glassmorphism system)
- **Animations**: CSS Keyframes & Framer Motion influences

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd FinTrackDashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the Database**:
   The app uses a local `db.db` file. Ensure it exists in the root directory.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## 🛡️ Stability & Accuracy
- **Local-Time Safe**: All queries are robust against UTC shifts to ensure your data always lands in the correct month.
- **Optimized Performance**: Isolated React state for high-frequency updates (like counters) and optimized chart rendering.

---
Built with ❤️ for precision financial tracking.

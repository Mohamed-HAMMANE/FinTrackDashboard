import { NextRequest, NextResponse } from "next/server";
import { closeDatabase, openDatabase } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        // Basic security check (Optional: recommend user sets an API_KEY in .env)
        const apiKey = request.headers.get("x-api-key");
        const storedKey = process.env.SYNC_API_KEY || "fintrack_local_sync_123";

        if (apiKey !== storedKey) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const dbPath = path.resolve(process.cwd(), "db.db");
        const backupPath = path.resolve(process.cwd(), "db.db.bak");

        // 1. Close current connection
        closeDatabase();

        // 2. Backup existing db
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath);
        }

        // 3. Replace file
        fs.writeFileSync(dbPath, buffer);

        // 4. Reopen database
        openDatabase();

        return NextResponse.json({
            success: true,
            message: "Database synced successfully",
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Sync error:", error);
        // Try to reopen if something failed
        try { openDatabase(); } catch (e) { }
        return NextResponse.json({ error: "Sync failed", details: error.message }, { status: 500 });
    }
}

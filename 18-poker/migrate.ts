import fs from "fs";
import path from "path";
import { db } from "./db";

export function migrate() {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        run_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
  );

  const applied = db
    .query("SELECT name FROM migrations")
    .all()
    .map((m: any) => m.name);

  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (applied.includes(file)) continue;
    console.log("Applying migration", file);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.run(sql);
    db.query("INSERT INTO migrations (name) VALUES (?)").run(file);
  }
}

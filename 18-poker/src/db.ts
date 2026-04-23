import Database from "bun:sqlite";
import path from "path";
export const db = new Database(path.join(__dirname, "..", "dev.sqlite3"));
db.run("PRAGMA journal_mode = WAL;");

import Database from "bun:sqlite";
export const db = new Database("dev.sqlite3");
db.run("PRAGMA journal_mode = WAL;");

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { env } from '../config/env.js';
import fs from 'fs';
import path from 'path';

// Resolve database path relative to CWD (project root)
const dbPath = path.resolve(process.cwd(), env.DATABASE_URL);

// Ensure the database directory exists (e.g. data/ after a fresh clone)
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Create SQLite instance with WAL mode for better concurrency
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

// Export drizzle instance
export const db = drizzle(sqlite, { schema });
export { sqlite };

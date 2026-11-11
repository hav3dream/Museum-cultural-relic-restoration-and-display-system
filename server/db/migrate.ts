import { sqlite } from './connection.js';

export async function runMigrations() {
  console.log('Running database migrations...');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      plan_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      stripe_subscription_id TEXT UNIQUE,
      current_period_start INTEGER,
      current_period_end INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS restorations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'processing',
      input_file_url TEXT,
      result_urls TEXT,
      algorithm TEXT,
      parameters TEXT,
      error_message TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      completed_at INTEGER
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      restoration_id INTEGER REFERENCES restorations(id),
      title TEXT,
      description TEXT,
      category TEXT,
      image_url TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Performance indexes on foreign keys and frequently queried columns
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_restorations_user_id ON restorations(user_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_restorations_status ON restorations(status);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);`);

  console.log('Database migrations completed successfully!');
}

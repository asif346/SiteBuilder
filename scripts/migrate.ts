/**
 * Run migrations using Neon HTTP (port 443) instead of TCP (5432).
 * Use when "npx drizzle-kit migrate" times out: npm run db:migrate
 */
import 'dotenv/config';
import path from 'path';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const url = process.env.DATABASE_URL;
if (!url?.trim()) {
  console.error('DATABASE_URL is not set. Add it to .env');
  process.exit(1);
}

const db = drizzle(url);
const migrationsFolder = path.join(process.cwd(), 'drizzle');

async function run() {
  console.log('Running migrations via Neon HTTP (port 443)...');
  await migrate(db, { migrationsFolder });
  console.log('Migrations complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

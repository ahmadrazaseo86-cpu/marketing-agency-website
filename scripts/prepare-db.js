const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL || '';
const envPath = path.join(__dirname, '..', '.env');

// 1. If .env file does not exist, create fallback .env
if (!fs.existsSync(envPath)) {
  const fallbackLines = [
    `DATABASE_URL="${dbUrl || 'file:./dev.db'}"`,
    `DIRECT_URL="${process.env.DIRECT_URL || dbUrl || 'file:./dev.db'}"`,
    `JWT_SECRET="${process.env.JWT_SECRET || 'nexarank-super-secure-production-jwt-secret-2026'}"`,
    `NEXT_PUBLIC_APP_URL="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"`,
  ];
  fs.writeFileSync(envPath, fallbackLines.join('\n') + '\n');
  console.log('[NexaRank] Created build-time .env file with active environment');
}

// 2. Fallback for environment variables in current process
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
  dbUrl = 'file:./dev.db';
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'nexarank-super-secure-production-jwt-secret-2026';
}

const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const targetSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sourceSchema = isPostgres
  ? path.join(__dirname, '..', 'prisma', 'schema.supabase.prisma')
  : path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');

if (fs.existsSync(sourceSchema)) {
  fs.copyFileSync(sourceSchema, targetSchema);
  console.log(`[NexaRank] Configured Prisma schema for: ${isPostgres ? 'PostgreSQL (Supabase)' : 'SQLite (Local/Fallback)'}`);
} else {
  console.log('[NexaRank] Retained existing prisma/schema.prisma');
}

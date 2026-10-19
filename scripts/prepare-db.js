const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const targetSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sourceSchema = isPostgres
  ? path.join(__dirname, '..', 'prisma', 'schema.supabase.prisma')
  : path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');

if (fs.existsSync(sourceSchema)) {
  fs.copyFileSync(sourceSchema, targetSchema);
  console.log(`[NexaRank] Configured Prisma schema for: ${isPostgres ? 'PostgreSQL (Supabase/Vercel)' : 'SQLite (Local Dev)'}`);
} else {
  console.log('[NexaRank] Retained existing prisma/schema.prisma');
}

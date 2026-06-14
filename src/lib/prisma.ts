import { PrismaClient } from '../generated/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!globalForPrisma.prisma) {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  if (isPostgres) {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  } else {
    // In Prisma 7, the better-sqlite3 adapter takes an options object with the URL.
    const adapter = new PrismaBetterSqlite3({
      url: dbUrl,
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
}

prisma = globalForPrisma.prisma;
export default prisma;

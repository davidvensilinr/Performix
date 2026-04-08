import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;

const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter, log: [] });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}


const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = "postgresql://postgres:ancythegrt123@db.ambjdrllnsadyptbctux.supabase.co:5432/postgres";

console.log('Connecting with URL:', connectionString);

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('Attempting to fetch organisations...');
        const result = await prisma.organisation.findMany();
        console.log('Successfully fetched organisations:', result);
    } catch (error) {
        console.error('Error fetching organisations:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end(); // close the pool explicitly if needed
    }
}

main();

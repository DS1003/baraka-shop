const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function run() {
    const prisma = new PrismaClient();
    try {
        const jobs = await (prisma.importJob).findMany();
        console.log("JOBS_LIST:", JSON.stringify(jobs));
    } catch (e) {
        console.log("JOBS_ERROR:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();

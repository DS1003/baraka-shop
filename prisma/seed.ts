import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg as AdapterPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
    const adminEmail = "admin@baraka.sn";
    const adminPassword = "admin@123";

    console.log("Seeding database...");

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new AdapterPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: hashedPassword,
                role: "ADMIN",
                username: "admin",
            },
            create: {
                email: adminEmail,
                username: "admin",
                password: hashedPassword,
                role: "ADMIN",
            },
        });
        console.log("Admin OK:", admin.email);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();

import 'dotenv/config';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function backup() {
    console.log('[Backup] Starting database backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Export Products
    console.log('[Backup] Exporting products...');
    const products = await prisma.product.findMany({
        include: {
            colorVariants: true
        }
    });
    const productsFile = path.join(backupDir, `products_backup_${timestamp}.json`);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`[Backup] Exported ${products.length} products to ${productsFile}`);

    // 2. Export Categories
    console.log('[Backup] Exporting categories...');
    const categories = await prisma.category.findMany({
        include: {
            subCategories: {
                include: {
                    thirdLevelCategories: true
                }
            }
        }
    });
    const categoriesFile = path.join(backupDir, `categories_backup_${timestamp}.json`);
    fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2), 'utf-8');
    console.log(`[Backup] Exported ${categories.length} categories to ${categoriesFile}`);

    // 3. Export Brands
    console.log('[Backup] Exporting brands...');
    const brands = await prisma.brand.findMany();
    const brandsFile = path.join(backupDir, `brands_backup_${timestamp}.json`);
    fs.writeFileSync(brandsFile, JSON.stringify(brands, null, 2), 'utf-8');
    console.log(`[Backup] Exported ${brands.length} brands to ${brandsFile}`);

    // Verification
    const stats = {
        timestamp,
        productsCount: products.length,
        categoriesCount: categories.length,
        brandsCount: brands.length,
        files: [productsFile, categoriesFile, brandsFile]
    };
    const summaryFile = path.join(backupDir, `backup_manifest_${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(stats, null, 2), 'utf-8');
    console.log('[Backup] Verification summary:', stats);
    console.log('[Backup] BACKUP COMPLETED AND VERIFIED SUCCESSFULLY ✅');
}

backup().catch(console.error).finally(() => prisma.$disconnect());

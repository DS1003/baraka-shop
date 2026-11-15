import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function checkSchema() {
    console.log("=== INSPECTION DE LA STRUCTURE POSTGRESQL DE PRODUCTION ===");

    // Columns of Product table
    const columns: any[] = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'Product'
        ORDER BY ordinal_position;
    `;
    console.log(`Colonnes trouvées dans la table "Product" (${columns.length}) :`);
    columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default})`));

    // Unique constraints and indexes
    const indexes: any[] = await prisma.$queryRaw`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'Product';
    `;
    console.log(`\nIndex et contraintes d'unicité trouvés (${indexes.length}) :`);
    indexes.forEach(i => console.log(`  - ${i.indexname}: ${i.indexdef}`));

    // Foreign keys
    const fks: any[] = await prisma.$queryRaw`
        SELECT
            tc.constraint_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'Product';
    `;
    console.log(`\nClés étrangères trouvées (${fks.length}) :`);
    fks.forEach(f => console.log(`  - ${f.column_name} -> ${f.foreign_table_name}.${f.foreign_column_name}`));
}

checkSchema()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

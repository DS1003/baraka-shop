import { NextResponse } from 'next/server';
import pg from 'pg';

// Direct database connection - bypasses Prisma model caching entirely
async function getPool() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
    });
    return pool;
}

export async function GET() {
    let pool: pg.Pool | null = null;
    try {
        pool = await getPool();
        
        const storesResult = await pool.query(`
            SELECT s.*, 
                   COALESCE(pc.count, 0)::int as product_count
            FROM "Store" s
            LEFT JOIN (
                SELECT "storeId", COUNT(*)::int as count 
                FROM "Product" 
                WHERE "storeId" IS NOT NULL 
                GROUP BY "storeId"
            ) pc ON pc."storeId" = s.id
            ORDER BY s."createdAt" DESC
        `);

        const stores = storesResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            logo: row.logo,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            _count: { products: row.product_count }
        }));

        const totalProducts = stores.reduce((acc: number, s: any) => acc + s._count.products, 0);

        return NextResponse.json({ 
            stores, 
            stats: { stores: stores.length, productWithStore: totalProducts } 
        });
    } catch (error: any) {
        console.error('API /admin/stores GET error:', error.message);
        return NextResponse.json(
            { stores: [], stats: { stores: 0, productWithStore: 0 }, error: error.message }, 
            { status: 500 }
        );
    } finally {
        if (pool) await pool.end();
    }
}

export async function POST(request: Request) {
    let pool: pg.Pool | null = null;
    try {
        pool = await getPool();
        const body = await request.json();
        const { action, data, id } = body;

        if (action === 'upsert') {
            if (id) {
                // Update
                await pool.query(
                    `UPDATE "Store" SET name = $1, slug = $2, logo = $3, description = $4, "updatedAt" = NOW() WHERE id = $5`,
                    [data.name, data.slug, data.logo || null, data.description || null, id]
                );
            } else {
                // Check for duplicates
                const existing = await pool.query(
                    `SELECT id FROM "Store" WHERE name = $1 OR slug = $2 LIMIT 1`,
                    [data.name, data.slug]
                );
                if (existing.rows.length > 0) {
                    return NextResponse.json({ 
                        success: false, 
                        message: `La boutique "${data.name}" existe déjà.` 
                    });
                }
                // Create
                await pool.query(
                    `INSERT INTO "Store" (id, name, slug, logo, description, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
                    [data.name, data.slug, data.logo || null, data.description || null]
                );
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            const products = await pool.query(
                `SELECT COUNT(*)::int as count FROM "Product" WHERE "storeId" = $1`, [id]
            );
            if (products.rows[0].count > 0) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Cette boutique contient ${products.rows[0].count} produit(s). Retirez-les d'abord.` 
                });
            }
            await pool.query(`DELETE FROM "Store" WHERE id = $1`, [id]);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, message: 'Action inconnue' }, { status: 400 });
    } catch (error: any) {
        console.error('API /admin/stores POST error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        if (pool) await pool.end();
    }
}

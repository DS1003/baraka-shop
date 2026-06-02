import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCache, setCache, invalidatePrefix } from '@/lib/redis';

export async function GET() {
    try {
        const cacheKey = 'api:physical-stores:all';
        const cached = await getCache<any>(cacheKey);
        if (cached) return NextResponse.json(cached);

        const result = await pool.query(`
            SELECT * FROM "PhysicalStore"
            ORDER BY "order" ASC, "createdAt" DESC
        `);

        const stores = result.rows;
        const published = stores.filter((s: any) => s.isPublished).length;
        const responseData = {
            stores,
            stats: { total: stores.length, published }
        };

        await setCache(cacheKey, responseData, 3600);
        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('API /admin/physical-stores GET error:', error.message);
        return NextResponse.json(
            { stores: [], stats: { total: 0, published: 0 }, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data, id } = body;

        if (action === 'upsert') {
            if (id) {
                await pool.query(
                    `UPDATE "PhysicalStore" SET
                        name = $1, slug = $2, image = $3, description = $4,
                        address = $5, phone = $6, hours = $7, type = $8,
                        city = $9, "mapUrl" = $10, "isClickCollect" = $11,
                        "isSav" = $12, "isPublished" = $13, "order" = $14,
                        "updatedAt" = NOW()
                    WHERE id = $15`,
                    [
                        data.name, data.slug, data.image || null, data.description || null,
                        data.address || null, data.phone || null, data.hours || null, data.type || null,
                        data.city || null, data.mapUrl || null, data.isClickCollect || false,
                        data.isSav || false, data.isPublished ?? true, data.order || 0, id
                    ]
                );
            } else {
                const existing = await pool.query(
                    `SELECT id FROM "PhysicalStore" WHERE slug = $1 LIMIT 1`,
                    [data.slug]
                );
                if (existing.rows.length > 0) {
                    return NextResponse.json({
                        success: false,
                        message: `Une boutique physique avec ce slug existe déjà.`
                    });
                }
                await pool.query(
                    `INSERT INTO "PhysicalStore"
                        (id, name, slug, image, description, address, phone, hours, type, city, "mapUrl", "isClickCollect", "isSav", "isPublished", "order", "createdAt", "updatedAt")
                    VALUES
                        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
                    [
                        data.name, data.slug, data.image || null, data.description || null,
                        data.address || null, data.phone || null, data.hours || null, data.type || null,
                        data.city || null, data.mapUrl || null, data.isClickCollect || false,
                        data.isSav || false, data.isPublished ?? true, data.order || 0
                    ]
                );
            }

            await invalidatePrefix('api:physical-stores:');
            await invalidatePrefix('physical-stores:');
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            await pool.query(`DELETE FROM "PhysicalStore" WHERE id = $1`, [id]);
            await invalidatePrefix('api:physical-stores:');
            await invalidatePrefix('physical-stores:');
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, message: 'Action inconnue' }, { status: 400 });
    } catch (error: any) {
        console.error('API /admin/physical-stores POST error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

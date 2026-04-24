import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch store
        const storeResult = await pool.query(
            `SELECT * FROM "Store" WHERE slug = $1 LIMIT 1`,
            [slug]
        );

        if (storeResult.rows.length === 0) {
            return NextResponse.json({ store: null, products: [] }, { status: 404 });
        }

        const store = storeResult.rows[0];

        // Fetch store's products with category and brand info
        const productsResult = await pool.query(`
            SELECT p.*,
                   c.name as "categoryName", c.slug as "categorySlug",
                   b.name as "brandName"
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            LEFT JOIN "Brand" b ON b.id = p."brandId"
            WHERE p."storeId" = $1
            ORDER BY p."createdAt" DESC
        `, [store.id]);

        const products = productsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            price: row.price,
            originalPrice: row.originalPrice,
            images: row.images,
            description: row.description,
            stock: row.stock,
            isActive: row.isActive,
            category: row.categoryName ? { name: row.categoryName, slug: row.categorySlug } : null,
            brand: row.brandName ? { name: row.brandName } : null,
        }));

        return NextResponse.json({ store, products });
    } catch (error: any) {
        console.error('API /store/[slug] error:', error.message);
        return NextResponse.json({ store: null, products: [], error: error.message }, { status: 500 });
    }
}

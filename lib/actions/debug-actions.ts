'use server';

import prisma from '@/lib/prisma';

export async function testConnection() {
    try {
        const count = await prisma.product.count();
        return { success: true, count };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

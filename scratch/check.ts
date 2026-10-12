import prisma from '../lib/prisma';

async function run() {
    try {
        const orderId = 'd24e3561-75d0-4702-922c-4d338f5c6739';
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });
        console.log("Order status is:", order?.status);
    } catch(e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();

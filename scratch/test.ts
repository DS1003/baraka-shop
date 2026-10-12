import prisma from '../lib/prisma';
import { notifyClientOrderStatusChange, notifyAdminsOrderStatusChange } from '../lib/notification-service';

async function run() {
    try {
        const orderId = 'd24e3561-75d0-4702-922c-4d338f5c6739';
        const status = 'SHIPPED';
        
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { select: { username: true, email: true } } }
        });
        
        if (!order) return console.log("Order not found");
        
        await prisma.order.update({
            where: { id: orderId },
            data: { status: status as any }
        });
        
        console.log("updated db");

        if (order) {
            const clientName = order.user.username || order.user.email || 'Client';
            await notifyClientOrderStatusChange(orderId, status).catch((e) => console.error('Error notifying client:', e));
            await notifyAdminsOrderStatusChange(orderId, status, clientName, order.total).catch((e) => console.error('Error notifying admins:', e));
        }
        
        console.log("Success!");
    } catch(e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();

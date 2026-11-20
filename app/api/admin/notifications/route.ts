import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserNotifications, getUnreadCount, markAllAsRead } from '@/lib/notification-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HEADERS_NO_CACHE = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
};

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
        }

        // Run both queries with individual timeouts to avoid a single slow query blocking the other
        const [notifications, unreadCount] = await Promise.all([
            Promise.race([
                getUserNotifications(session.user.id, 20),
                new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 10000)),
            ]),
            Promise.race([
                getUnreadCount(session.user.id),
                new Promise<number>((resolve) => setTimeout(() => resolve(0), 10000)),
            ]),
        ]);

        return NextResponse.json(
            { notifications, unreadCount },
            { headers: HEADERS_NO_CACHE }
        );
    } catch (error) {
        console.error('Admin notifications API error:', error);
        // Return empty data instead of crashing — the UI will just show no notifications
        return NextResponse.json(
            { notifications: [], unreadCount: 0 },
            { status: 200, headers: HEADERS_NO_CACHE }
        );
    }
}

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const result = await markAllAsRead(session.user.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Mark all read API error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

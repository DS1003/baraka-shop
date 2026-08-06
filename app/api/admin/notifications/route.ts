import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserNotifications, getUnreadCount, markAllAsRead } from '@/lib/notification-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
        }

        const [notifications, unreadCount] = await Promise.all([
            getUserNotifications(session.user.id, 20),
            getUnreadCount(session.user.id),
        ]);

        return NextResponse.json(
            { notifications, unreadCount },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                },
            }
        );
    } catch (error) {
        console.error('Admin notifications API error:', error);
        return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const result = await markAllAsRead(session.user.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Mark all read API error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

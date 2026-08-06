import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserNotifications, getUnreadCount, markAllAsRead, markAsRead } from '@/lib/notification-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
        }

        const [notifications, unreadCount] = await Promise.all([
            getUserNotifications(session.user.id, 50),
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
        console.error('Client notifications API error:', error);
        return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const body = await request.json();

        if (body.action === 'markAllRead') {
            const result = await markAllAsRead(session.user.id);
            return NextResponse.json(result);
        }

        if (body.action === 'markRead' && body.notificationId) {
            const result = await markAsRead(body.notificationId);
            return NextResponse.json(result);
        }

        return NextResponse.json({ success: false, message: 'Action inconnue' }, { status: 400 });
    } catch (error) {
        console.error('Client notification action error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

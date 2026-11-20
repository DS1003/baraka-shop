import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDjangoImageUrl } from '@/lib/config/django-config';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    // Vérification des privilèges admin
    if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_AUTH_FOR_SCRIPTS !== 'true') {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return new NextResponse('Non autorisé', { status: 401 });
        }
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl || typeof targetUrl !== 'string') {
        return new NextResponse("Paramètre 'url' manquant", { status: 400 });
    }

    // Sécurité SSRF stricte : autorise uniquement les domaines de confiance déclarés
    if (!isAllowedDjangoImageUrl(targetUrl)) {
        return new NextResponse('URL non autorisée pour des raisons de sécurité SSRF', { status: 403 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'BarakaShop-Admin-ImageProxy/1.0',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            },
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
            return new NextResponse(`Erreur image source (${response.status})`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err: any) {
        return new NextResponse(err.message || 'Erreur proxy image', { status: 500 });
    }
}

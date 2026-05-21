import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const { auth } = NextAuth(authConfig)

const MAINTENANCE_BYPASS = ['/maintenance', '/maintenance.json', '/login', '/api', '/admin', '/_next']

function bypassesMaintenance(pathname: string) {
    if (MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))) return true
    if (/\.(ico|png|jpg|jpeg|svg|webp|gif|woff2?|css|js)$/i.test(pathname)) return true
    return false
}

async function checkMaintenanceMode(req: NextRequest): Promise<boolean> {
    if (process.env.MAINTENANCE_MODE === 'true') return true

    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000'
    const protocol = req.nextUrl.protocol
    const base = `${protocol}//${host}`

    try {
        const fileRes = await fetch(`${base}/maintenance.json`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
        })
        if (fileRes.ok) {
            const data = await fileRes.json()
            return !!data.maintenanceMode
        }
    } catch {
        /* try API fallback */
    }

    try {
        const res = await fetch(`${base}/api/site-status`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
        })
        if (res.ok) {
            const data = await res.json()
            return !!data.maintenanceMode
        }
    } catch {
        /* ignore */
    }

    return false
}

function addSecurityHeaders(response: NextResponse) {
    // Prevent the maintenance page from being framed (clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response
}

export default auth(async (req) => {
    const { nextUrl } = req
    const pathname = nextUrl.pathname

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    })
    const isAdmin = token?.role === 'ADMIN'
    const isLoggedIn = !!token

    // ── Maintenance mode check for public routes ──
    if (!bypassesMaintenance(pathname) && !isAdmin) {
        const maintenanceMode = await checkMaintenanceMode(req)
        if (maintenanceMode && pathname !== '/maintenance') {
            const response = NextResponse.redirect(new URL('/maintenance', nextUrl))
            return addSecurityHeaders(response)
        }
    }

    // ── Maintenance page access control ──
    if (pathname === '/maintenance') {
        if (isAdmin) {
            // Admins should go to admin settings instead
            return NextResponse.redirect(new URL('/admin/settings', nextUrl))
        }

        // If site is not in maintenance, redirect visitors back home
        const maintenanceMode = await checkMaintenanceMode(req)
        if (!maintenanceMode) {
            return NextResponse.redirect(new URL('/', nextUrl))
        }

        // Add security headers to the maintenance page
        const response = NextResponse.next()
        addSecurityHeaders(response)
        // Prevent caching of the maintenance page
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        response.headers.set('Pragma', 'no-cache')
        return response
    }

    // ── Admin route protection ──
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginRoute = pathname === '/login'

    if (isAdminRoute) {
        if (isLoggedIn) {
            if (isAdmin) return
            return NextResponse.redirect(new URL('/', nextUrl))
        }
        return NextResponse.redirect(new URL('/login', nextUrl))
    }

    if (isLoginRoute && isLoggedIn) {
        const redirectUrl = isAdmin ? '/admin' : '/'
        return NextResponse.redirect(new URL(redirectUrl, nextUrl))
    }
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

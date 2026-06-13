import { NextResponse } from 'next/server'
import { getSiteLogos } from '@/lib/actions/site-config-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const logos = await getSiteLogos()

        return NextResponse.json(logos, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        })
    } catch (error) {
        console.error('Error fetching site logos:', error)
        return NextResponse.json(
            { headerLogo: null, footerLogo: null, loaderLogo: null },
            { status: 200 }
        )
    }
}

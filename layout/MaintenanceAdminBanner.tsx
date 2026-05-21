import Link from 'next/link'
import { auth } from '@/auth'
import { isMaintenanceMode } from '@/lib/site-maintenance'
import { AlertTriangle } from 'lucide-react'

export async function MaintenanceAdminBanner() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return null

    const maintenance = await isMaintenanceMode()
    if (!maintenance) return null

    return (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-bold z-[100] relative">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                    Mode maintenance actif — les visiteurs voient la page de maintenance. Vous
                    accédez au site car vous êtes administrateur.
                </span>
                <Link
                    href="/admin/settings"
                    className="underline underline-offset-2 hover:text-amber-100 whitespace-nowrap"
                >
                    Gérer
                </Link>
            </div>
        </div>
    )
}

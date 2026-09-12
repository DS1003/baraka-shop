import { Header } from '@/layout/Header'
import { Footer } from '@/layout/Footer'
import { MaintenanceAdminBanner } from '@/layout/MaintenanceAdminBanner'
import { PromotionPopup } from '@/components/marketing/PromotionPopup'

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <MaintenanceAdminBanner />
            <Header />
            <main className="flex-grow flex flex-col" suppressHydrationWarning>
                {children}
            </main>
            <Footer />
            <PromotionPopup />
        </>
    )
}

import { Header } from '@/layout/Header'
import { Footer } from '@/layout/Footer'
import { MaintenanceAdminBanner } from '@/layout/MaintenanceAdminBanner'
import { PromotionPopup } from '@/components/marketing/PromotionPopup'
import { ScrollProgressBar } from '@/components/ScrollProgressBar'
import { MobileBottomNav } from '@/layout/MobileBottomNav'
import { Toaster } from 'sonner'

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <ScrollProgressBar />
            <MaintenanceAdminBanner />
            <Header />
            <main className="flex-grow flex flex-col pb-16 md:pb-0" suppressHydrationWarning>
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <PromotionPopup />
            <Toaster richColors position="top-right" />
        </>
    )
}


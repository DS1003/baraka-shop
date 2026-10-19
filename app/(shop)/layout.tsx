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
            <main className="flex-grow flex flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-0" suppressHydrationWarning>
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <PromotionPopup />
            <Toaster richColors position="top-right" />
        </>
    )
}


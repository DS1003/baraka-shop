import { Header } from '@/layout/Header'
import { Footer } from '@/layout/Footer'

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <main className="flex-grow flex flex-col" suppressHydrationWarning>
                {children}
            </main>
            <Footer />
        </>
    )
}

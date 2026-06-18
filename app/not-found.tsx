import Link from 'next/link'
import { Home, ShoppingBag, ArrowRight } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-[#f8f9fb] px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl" />

            <div className="max-w-max mx-auto text-center relative z-10">
                <main>
                    <p className="text-8xl sm:text-[150px] font-black text-primary/10 select-none tracking-tighter leading-none mb-4 md:mb-8">
                        404
                    </p>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-4xl sm:text-6xl md:text-8xl font-black text-primary drop-shadow-xl select-none tracking-tighter">
                            404
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1B1F3B] tracking-tight">
                            Page introuvable
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 font-medium max-w-lg mx-auto">
                            Oups ! Il semblerait que vous vous soyez égaré dans nos rayons. La page que vous recherchez n'existe plus ou a été déplacée.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href="/"
                            className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-[#1B1F3B] text-white hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all font-black uppercase tracking-widest text-xs"
                        >
                            <Home className="w-4 h-4" />
                            Retour à l'accueil
                        </Link>
                        
                        <Link 
                            href="/boutique"
                            className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white text-[#1B1F3B] border-2 border-gray-100 hover:border-[#1B1F3B] hover:shadow-lg transition-all font-black uppercase tracking-widest text-xs"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Voir la boutique
                            <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    )
}

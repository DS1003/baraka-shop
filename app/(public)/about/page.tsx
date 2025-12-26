import Image from 'next/image'
import { CheckCircle2, Clock, Globe } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Header Hero */}
            <div className="relative py-24 bg-secondary overflow-hidden">
                <div className="container px-4 mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de <span className="text-primary">Baraka</span></h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Nous redéfinissons le commerce électronique au Sénégal en alliant technologie de pointe, authenticité et service client d'exception.
                    </p>
                </div>
                {/* Decorative BG */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2" />
                </div>
            </div>

            <div className="container px-4 mx-auto py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                        <Image
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600"
                            alt="Notre Équipe"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Fondée avec la vision de connecter les Sénégalais aux meilleures technologies mondiales, Baraka s'engage à offrir une expérience d'achat sécurisée, transparente et rapide.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Nous ne vendons pas seulement des produits ; nous apportons des solutions qui améliorent votre quotidien, que vous soyez un professionnel créatif, un étudiant ambitieux ou un passionné de tech.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-secondary/50 border border-border">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Authenticité Garantie</h3>
                        <p className="text-muted-foreground text-sm">
                            Tous nos produits proviennent directement des constructeurs ou de distributeurs agréés. 0 contrefaçon.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-secondary/50 border border-border">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Service Après-Vente</h3>
                        <p className="text-muted-foreground text-sm">
                            Une équipe dédiée à Dakar pour répondre à vos questions et gérer vos garanties en temps record.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-secondary/50 border border-border">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Standards Internationaux</h3>
                        <p className="text-muted-foreground text-sm">
                            Nous appliquons les standards de service client des géants du e-commerce, adaptés à la réalité locale.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

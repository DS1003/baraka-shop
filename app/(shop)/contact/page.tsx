'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import {
    Phone,
    Mail,
    MapPin,
    MessageSquare,
    ChevronRight,
    Send,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { submitContactMessage } from '@/lib/actions/contact-actions'
import { toast } from 'sonner'

export default function ContactPage() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Conseil Achat',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires (Nom, Email et Message).');
            try { toast.error('Veuillez remplir tous les champs obligatoires.'); } catch {}
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitContactMessage({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                subject: formData.subject,
                message: formData.message.trim(),
            });

            if (res.success) {
                // Instantly update UI to success state
                setIsSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: 'Conseil Achat',
                    message: '',
                });
                try { toast.success('Message envoyé avec succès !'); } catch {}
            } else {
                const err = res.error || "Une erreur est survenue lors de l'envoi.";
                setErrorMessage(err);
                try { toast.error(err); } catch {}
            }
        } catch (err: any) {
            console.error('Contact submit error:', err);
            const msg = err?.message || "Impossible d'envoyer votre message pour le moment.";
            setErrorMessage(msg);
            try { toast.error(msg); } catch {}
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: 'cover' }} />
                <Container className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6"
                    >
                        Contactez-<span className="text-primary italic">nous</span>
                    </motion.h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">
                        Notre équipe d'experts est à votre écoute pour toute demande d'information, conseil technique ou assistance.
                    </p>
                </Container>
            </div>

            <section className="py-20">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Contact Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
                                <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-8">Envoyez-nous un message</h2>

                                {isSuccess ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                            <Send className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-black text-emerald-950">Message envoyé avec succès !</h3>
                                        <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                                            Merci de nous avoir contactés. Votre message a bien été transmis à notre service client et enregistré. Nous reviendrons vers vous très rapidement par email ou par téléphone.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsSuccess(false)}
                                            className="mt-4 px-8 py-3 bg-[#1B1F3B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-all"
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                                                Nom Complet <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Ex: Abdoulaye Diop"
                                                className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm font-bold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="Ex: abdoulaye@example.com"
                                                className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm font-bold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                                                Téléphone (optionnel)
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Ex: +221 77 123 45 67"
                                                className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm font-bold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                                                Sujet <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="Conseil Achat">Conseil Achat</option>
                                                <option value="Suivi de commande">Suivi de commande</option>
                                                <option value="Service Après-Vente">Service Après-Vente</option>
                                                <option value="Demande de devis">Demande de devis</option>
                                                <option value="Autre demande">Autre demande</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows={6}
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                                placeholder="Dites-nous comment nous pouvons vous aider..."
                                                className="bg-gray-50 rounded-3xl border border-gray-100 p-6 outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm font-bold resize-none"
                                            />
                                        </div>

                                        {errorMessage && (
                                            <div className="md:col-span-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                                                <span>{errorMessage}</span>
                                            </div>
                                        )}

                                        <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto h-16 px-12 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#1B1F3B] transition-all shadow-xl shadow-primary/20 group disabled:opacity-60 cursor-pointer"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        Envoi en cours...
                                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Envoyer le message
                                                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>

                                            <a
                                                href="https://wa.me/221765149898?text=Bonjour%20Baraka%20Shop%2C%20j'aimerais%20avoir%20des%20renseignements..."
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-2 py-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Ou contact direct sur WhatsApp
                                            </a>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Contact Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="bg-[#1B1F3B] rounded-[3rem] p-12 text-white shadow-2xl shadow-[#1B1F3B]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

                                <h3 className="text-xl font-black uppercase tracking-widest mb-10">Nos Coordonnées</h3>

                                <div className="flex flex-col gap-8">
                                    <ContactDetail icon={Phone} label="Téléphone" value="+221 33 822 34 22" />
                                    <ContactDetail icon={Mail} label="Email" value="contact@baraka.sn" />
                                    <ContactDetail icon={MapPin} label="Siège Social" value="Rue Avenue ABDOU, 90 Rue Av. K. Bourgi, Dakar" />
                                    <ContactDetail icon={MessageSquare} label="WhatsApp" value="+221 76 514 98 98" />
                                </div>

                                <div className="mt-12 pt-12 border-t border-white/10 flex flex-col gap-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Suivez-nous</span>
                                    <div className="flex gap-4">
                                        <SocialIcon icon={Facebook} />
                                        <SocialIcon icon={Instagram} href="https://www.instagram.com/baraka.sn/" />
                                        <SocialIcon icon={Twitter} />
                                        <SocialIcon icon={Youtube} />
                                    </div>
                                </div>
                            </div>

                            {/* Work Hours */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6">Heures d'ouverture</h3>
                                <div className="flex flex-col gap-4">
                                    <HourRow day="Lun - Ven" hours="09:00 - 19:30" />
                                    <HourRow day="Samedi" hours="10:00 - 18:00" />
                                    <HourRow day="Dimanche" hours="Fermé" isClosed />
                                </div>
                            </div>
                        </div>

                    </div>
                </Container>
            </section>
        </main>
    )
}

function ContactDetail({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
            </div>
        </div>
    )
}

function SocialIcon({ icon: Icon, href = "#" }: { icon: any, href?: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
            <Icon className="w-5 h-5" />
        </a>
    )
}

function HourRow({ day, hours, isClosed }: { day: string, hours: string, isClosed?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-bold text-gray-400">{day}</span>
            <span className={cn("text-xs font-black uppercase tracking-tight", isClosed ? "text-red-500" : "text-[#1B1F3B]")}>{hours}</span>
        </div>
    )
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/lib/actions/newsletter-actions';
import { Container } from '@/ui/Container';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const handleUnsubscribe = async () => {
        if (!token) {
            setStatus('error');
            setMessage('Lien de désinscription manquant ou invalide.');
            return;
        }

        setStatus('loading');
        try {
            const res = await unsubscribeFromNewsletter(token);
            if (res.success) {
                setStatus('success');
                setMessage(res.message || 'Votre désinscription a bien été prise en compte.');
                if (res.email) setEmail(res.email);
            } else {
                setStatus('error');
                setMessage(res.error || 'Impossible de traiter la demande.');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err?.message || 'Une erreur inattendue est survenue.');
        }
    };

    useEffect(() => {
        if (token) {
            handleUnsubscribe();
        } else {
            setStatus('error');
            setMessage('Aucun jeton de désinscription fourni.');
        }
    }, [token]);

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl text-center">
            {status === 'loading' && (
                <div className="py-8 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold text-gray-600">Traitement de votre désinscription en cours...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-4 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 mb-2">Désinscription confirmée</h1>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {message}
                        {email && (
                            <span className="block font-semibold text-gray-800 mt-1">({email})</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        Vous ne recevrez plus nos emails promotionnels. Vous pouvez vous réinscrire à tout moment depuis notre boutique.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B1F3B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="py-4 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 mb-2">Une erreur est survenue</h1>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {message}
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B1F3B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la boutique
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Container className="py-12">
            <Suspense fallback={
                <div className="max-w-md mx-auto my-12 p-8 text-center text-sm text-gray-500">
                    Chargement...
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
        </Container>
    );
}

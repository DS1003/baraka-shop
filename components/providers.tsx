'use client';

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { CartProvider } from "@/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Nettoyage des attributs injectés par les extensions (ex: Bitdefender)
        const attributesToRemove = ['bis_skin_checked', 'data-gr-ext-installed', 'data-new-gr-c-s-check-loaded', 'gr-ext-installed'];

        const cleanup = () => {
            attributesToRemove.forEach(attr => {
                document.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr));
                if (document.documentElement.hasAttribute(attr)) document.documentElement.removeAttribute(attr);
            });
        };

        cleanup();

        // Observer les changements futurs
        const observer = new MutationObserver(cleanup);
        observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);

    return (
        <SessionProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </SessionProvider>
    );
}

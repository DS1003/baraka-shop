import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentCollaboratorAction } from '@/lib/actions/collaborator-actions';
import { CollaboratorNav } from './components/CollaboratorNav';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Espace Collaborateur — Baraka Shop',
  description: 'Portail personnel dédié aux collaborateurs commerciaux de Baraka Shop',
};

export default async function CollaboratorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentCollaboratorAction();

  // Révocation immédiate côté serveur si non actif
  if (!result.authorized || !result.collaborator) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900">Accès Collaborateur Restreint</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Cet espace est strictement réservé aux utilisateurs disposant d'une collaboration active avec Baraka Shop.
            Si votre statut a été suspendu ou si votre compte n'est pas encore activé, veuillez contacter l'administration.
          </p>
          <div className="pt-2">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-[#d95213] text-white font-semibold text-sm transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à mon compte client</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const collaborator = result.collaborator;

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#1B1F3B] text-primary flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#1B1F3B]">
                BARAKA<span className="text-primary font-bold">SHOP</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md bg-orange-500/10 text-primary border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider">
                Portail Collaborateur
              </span>
            </div>
          </Link>
        </div>

        {/* Right side navigation & user avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            <span>Aller sur la boutique</span>
          </Link>

          <Link
            href="/account"
            className="flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{collaborator.name}</p>
              <p className="text-[10px] text-slate-500">{collaborator.title}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#1B1F3B] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {collaborator.image ? (
                <img src={collaborator.image} alt={collaborator.name} className="w-full h-full object-cover" />
              ) : (
                collaborator.name.charAt(0).toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dedicated Collaborator Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <CollaboratorNav collaborator={collaborator} />
          </aside>

          {/* Dynamic Page Content */}
          <main className="lg:col-span-9 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

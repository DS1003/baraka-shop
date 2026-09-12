'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteLogos } from '@/lib/hooks/useSiteLogos';

interface CampaignData {
  id: string;
  name: string;
  popupTitle: string | null;
  popupDescription: string | null;
  popupImage: string | null;
  ctaText: string;
  ctaLink: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  displayFrequency: string;
  firstPurchaseOnly: boolean;
}

function getStorageKey(campaignId: string) {
  return `baraka-promo-seen-${campaignId}`;
}

function shouldShowPopup(campaign: CampaignData): boolean {
  if (typeof window === 'undefined') return false;

  // The user requested that the popup should ALWAYS display as long as the promo is active,
  // ignoring frequency rules like 'ONCE_PER_DAY' or 'ONCE_PER_SESSION'.
  return true;
}

function markPopupSeen(campaign: CampaignData) {
  if (typeof window === 'undefined') return;

  const key = getStorageKey(campaign.id);
  const now = new Date().toISOString();

  if (campaign.displayFrequency === 'ONCE_PER_SESSION') {
    sessionStorage.setItem(key, now);
  } else {
    localStorage.setItem(key, now);
  }
}

function trackEvent(campaignId: string, event: string) {
  fetch('/api/promotions/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId, event }),
  }).catch(() => {});
}

export function PromotionPopup() {
  const { headerLogo } = useSiteLogos();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    // Small delay to not block initial page render
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/promotions/active-campaign');
        const data = await res.json();

        if (cancelled || !data.campaign) return;

        const c = data.campaign as CampaignData;
        if (shouldShowPopup(c)) {
          setCampaign(c);
          // Slightly delay popup appearance for better UX
          setTimeout(() => {
            if (!cancelled) {
              setIsVisible(true);
              trackEvent(c.id, 'popup_view');
            }
          }, 800);
        }
      } catch {
        // Silently fail — don't break the site
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while popup is open
    document.body.style.overflow = 'hidden';

    // Focus the close button when popup opens
    setTimeout(() => closeButtonRef.current?.focus(), 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleClose = useCallback(() => {
    if (campaign) {
      markPopupSeen(campaign);
      trackEvent(campaign.id, 'popup_close');
    }
    setIsVisible(false);
  }, [campaign]);

  const handleCtaClick = useCallback(() => {
    if (campaign) {
      markPopupSeen(campaign);
      trackEvent(campaign.id, 'popup_click');
    }
    setIsVisible(false);
  }, [campaign]);

  const handleCopy = useCallback(async () => {
    if (!campaign) return;
    try {
      await navigator.clipboard.writeText(campaign.couponCode);
      setCopied(true);
      trackEvent(campaign.id, 'code_copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = campaign.couponCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      trackEvent(campaign.id, 'code_copy');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [campaign]);

  if (!campaign) return null;

  const discountLabel =
    campaign.discountType === 'PERCENTAGE'
      ? `${campaign.discountValue}%`
      : `${campaign.discountValue.toLocaleString()} FCFA`;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-[#1B1F3B]/40 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Popup */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={campaign.popupTitle || 'Offre promotionnelle'}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 pointer-events-none"
          >
            {/* ── Card Container: wide vertical layout, no scroll ── */}
            <div className="relative w-full max-w-[620px] pointer-events-auto bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
              
              {/* Close Button (Floating) */}
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                aria-label="Fermer"
                className="absolute top-3 right-3 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-gray-500 hover:text-gray-900 shadow-lg border border-gray-100 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#E8621A]/50 backdrop-blur-sm"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* ── Top: Hero Image ── */}
              <div className="relative w-full h-[25vh] sm:h-[30vh] min-h-[150px] max-h-[280px] shrink overflow-hidden">
                <Image
                  src="/images/promo/baraka-promo-hero@1x.webp"
                  alt="Baraka Shop - Promotions Tech & Électronique"
                  fill
                  sizes="(max-width: 640px) 100vw, 620px"
                  className="object-cover object-top"
                  priority
                  quality={90}
                />
                {/* Bottom gradient for smooth transition */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 via-white/30 to-transparent pointer-events-none" />

                {/* Badge "Offre spéciale" */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-white/60 text-[#1B1F3B] backdrop-blur-md shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8621A]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Offre spéciale</span>
                </motion.div>
              </div>

              {/* ── Bottom: Content ── */}
              <div className="relative flex flex-col items-start text-left px-5 sm:px-8 pt-8 pb-5 sm:pb-6 w-full shrink-0">

                {/* ── Overlapping Discount Badge ── */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="bg-gradient-to-r from-[#E8621A] to-[#f07b3a] text-white px-6 py-2 rounded-full shadow-lg border-[4px] border-white inline-flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-lg sm:text-xl font-black tracking-tight">-{discountLabel}</span>
                  </motion.div>
                </div>

                {/* ── Text & Logo ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4 w-full flex flex-col"
                >
                  {/* Logo */}
                  <div className="mb-3 inline-flex self-start">
                    <img 
                      src={headerLogo || "/logo-icon.png"} 
                      alt="Baraka Shop Logo" 
                      className="h-8 md:h-10 w-auto object-contain"
                    />
                  </div>
                  
                  <h2 className="text-lg sm:text-xl font-black text-[#1B1F3B] leading-snug tracking-tight mb-2">
                    {campaign.popupTitle || 'Bienvenue sur Baraka.sn ! 🎉'}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-gray-700 font-semibold leading-relaxed w-full text-justify">
                    {campaign.popupDescription || 'Profitez de cette réduction exclusive sur votre première commande pour découvrir nos nouveautés.'}
                  </p>
                </motion.div>

                {/* ── Promo Code Box ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl p-3 mb-4"
                >
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-left">
                    Votre code promo
                  </p>
                  
                  <div className="flex items-center gap-2.5 w-full">
                    <div className="flex-1 h-11 sm:h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm px-2">
                      <span className="text-base sm:text-lg font-black text-[#1B1F3B] tracking-[0.2em] select-all truncate">
                        {campaign.couponCode}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCopy}
                      aria-label={copied ? 'Code copié' : 'Copier le code'}
                      className={`h-11 sm:h-12 px-4 sm:px-5 rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-2 shrink-0 ${
                        copied
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : 'bg-[#1B1F3B] text-white hover:bg-[#2D3359]'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* ── CTA & Dismiss ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full flex flex-col items-center gap-2.5"
                >
                  <Link href={campaign.ctaLink || '/shop'} onClick={handleCtaClick} className="block w-full">
                    <button className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#E8621A] to-[#d95213] text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#E8621A]/30 hover:shadow-xl hover:shadow-[#E8621A]/40 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 group">
                      {campaign.ctaText || "J'en profite !"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <button
                    onClick={handleClose}
                    className="text-[10px] sm:text-[11px] font-semibold text-gray-400 hover:text-gray-600 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-all"
                  >
                    Pas maintenant
                  </button>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

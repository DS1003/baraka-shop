'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/ui/Container';
import {
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Clock,
    ShieldCheck,
    Save,
    Phone,
    User as UserIcon,
    Trash2,
    Lock,
    Bell,
    ChevronDown,
    Truck,
    PackageCheck,
    XCircle,
    History,
    CheckCircle2,
    ShoppingCart,
    ShoppingBag,
    Eye,
    Check,
    Sparkles,
    ArrowUpRight,
    ExternalLink,
    Tag,
    Share2,
    Search,
    X,
    Filter,
    SlidersHorizontal,
    RotateCcw,
    Mail,
    EyeOff,
    AlertCircle,
    Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateProfile, toggleWishlistAction, changeUserPassword, updateUserSettings } from '@/lib/actions/user-actions';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/admin-actions';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useSiteLogos } from '@/lib/hooks/useSiteLogos';
import { WatermarkOverlay } from '@/ui/WatermarkOverlay';

interface AccountContentProps {
    user: any;
}

const VALID_TABS = ['orders', 'notifications', 'wishlist', 'profile', 'settings'] as const;
type TabType = typeof VALID_TABS[number];

export default function AccountContent({ user }: AccountContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as TabType | null;

    const [activeTab, setActiveTab] = useState<TabType>(() => {
        if (tabParam && VALID_TABS.includes(tabParam)) {
            return tabParam;
        }
        return 'orders';
    });

    // Mobile dropdown selector state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Keep activeTab in sync when query param changes
    useEffect(() => {
        if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    const handleTabChange = (tabId: TabType) => {
        setActiveTab(tabId);
        router.replace(`/account?tab=${tabId}`, { scroll: false });
    };

    // Wishlist local state for instant optimistic updates
    const [wishlist, setWishlist] = useState<any[]>(user.wishlist || []);
    const [wishlistSearch, setWishlistSearch] = useState('');
    const [wishlistFilter, setWishlistFilter] = useState<'all' | 'instock' | 'promo'>('all');
    const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user.wishlist) {
            setWishlist(user.wishlist);
        }
    }, [user.wishlist]);

    // Cart hook & site logos
    const { addToCart } = useCart();
    const { headerLogo } = useSiteLogos();

    // Profile form state
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSavedRecently, setIsSavedRecently] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || ''
    });

    const isProfileDirty = useMemo(() => {
        return (
            profileData.username !== (user.username || '') ||
            profileData.phone !== (user.phone || '') ||
            profileData.address !== (user.address || '')
        );
    }, [profileData, user.username, user.phone, user.address]);

    const handleResetProfile = () => {
        setProfileData({
            username: user.username || '',
            phone: user.phone || '',
            address: user.address || ''
        });
        toast.info("Modifications réinitialisées.");
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        const cleanedData = {
            username: profileData.username.trim(),
            phone: profileData.phone.trim(),
            address: profileData.address.trim()
        };

        const result = await updateProfile(cleanedData);

        if (result.success) {
            setIsSavedRecently(true);
            setTimeout(() => setIsSavedRecently(false), 2500);
            toast.success('Profil mis à jour avec succès');
            router.refresh();
        } else {
            toast.error(result.error || 'Erreur lors de la mise à jour');
        }
        setIsUpdating(false);
    };

    // ---------------- PASSWORD & SECURITY STATES ----------------
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Notification preferences state
    const initialNotifs = (user?.metadata as any)?.notifications || {};
    const [emailNotifs, setEmailNotifs] = useState<boolean>(initialNotifs.emails ?? true);
    const [smsNotifs, setSmsNotifs] = useState<boolean>(initialNotifs.sms ?? false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

    // Password criteria check (ANSSI / OWASP standard)
    const passwordCriteria = useMemo(() => {
        return {
            minLength: newPassword.length >= 8,
            hasUpper: /[A-Z]/.test(newPassword),
            hasLower: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
        };
    }, [newPassword]);

    const criteriaScore = useMemo(() => {
        let score = 0;
        if (passwordCriteria.minLength) score++;
        if (passwordCriteria.hasUpper) score++;
        if (passwordCriteria.hasLower) score++;
        if (passwordCriteria.hasNumber) score++;
        if (passwordCriteria.hasSpecial) score++;
        return score;
    }, [passwordCriteria]);

    const allCriteriaMet = criteriaScore === 5;
    const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
    const isSameAsCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword;

    const canSubmitPassword = 
        currentPassword.trim().length > 0 &&
        allCriteriaMet &&
        passwordsMatch &&
        !isSameAsCurrent &&
        !isChangingPassword;

    const strengthConfig = useMemo(() => {
        if (!newPassword) return { label: 'Non renseigné', color: 'bg-gray-200', text: 'text-gray-400', level: 0 };
        if (criteriaScore <= 2) return { label: 'Faible', color: 'bg-rose-500', text: 'text-rose-600', level: 1 };
        if (criteriaScore === 3) return { label: 'Moyen', color: 'bg-amber-500', text: 'text-amber-600', level: 2 };
        if (criteriaScore === 4) return { label: 'Bon', color: 'bg-blue-500', text: 'text-blue-600', level: 3 };
        return { label: 'Robuste (Conforme)', color: 'bg-emerald-500', text: 'text-emerald-600', level: 4 };
    }, [newPassword, criteriaScore]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error("Veuillez renseigner votre mot de passe actuel.");
            return;
        }
        if (!allCriteriaMet) {
            toast.error("Le nouveau mot de passe ne respecte pas tous les critères de sécurité.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("La confirmation du mot de passe ne correspond pas.");
            return;
        }
        if (currentPassword === newPassword) {
            toast.error("Le nouveau mot de passe doit être différent de l'ancien mot de passe.");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await changeUserPassword({
                currentPassword,
                newPassword,
                confirmPassword
            });

            if (res.success) {
                toast.success(res.message || "Mot de passe mis à jour avec succès !");
                setPasswordSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                toast.error(res.error || "Erreur lors de la mise à jour du mot de passe.");
            }
        } catch {
            toast.error("Une erreur inattendue est survenue.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsSavingPreferences(true);
        try {
            const res = await updateUserSettings({
                settings: {
                    notifications: {
                        emails: emailNotifs,
                        sms: smsNotifs
                    }
                }
            });
            if (res.success) {
                toast.success("Vos préférences de notifications ont été enregistrées !");
            } else {
                toast.error(res.error || "Erreur lors de l'enregistrement des préférences.");
            }
        } catch {
            toast.error("Erreur de connexion.");
        } finally {
            setIsSavingPreferences(false);
        }
    };

    // Wishlist actions with undo
    const handleRemoveWishlist = async (id: string, name?: string) => {
        const itemToRemove = wishlist.find(p => p.id === id);
        // Optimistic removal
        setWishlist(prev => prev.filter(p => p.id !== id));

        toast.success(name ? `"${name}" retiré de vos coups de cœur` : 'Article retiré de vos coups de cœur', {
            action: itemToRemove ? {
                label: 'Annuler',
                onClick: async () => {
                    setWishlist(prev => [itemToRemove, ...prev]);
                    await toggleWishlistAction(id);
                    toast.success(`"${itemToRemove.name}" restauré !`);
                }
            } : undefined
        });

        const result = await toggleWishlistAction(id);
        if (!result.success) {
            // Revert on error
            setWishlist(user.wishlist || []);
            toast.error("Impossible de retirer l'article pour le moment.");
        }
    };

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image: product.images?.[0] || product.image || '/placeholder.png',
            quantity: 1,
        });

        // Tactile added feedback for 1.6s
        setAddedIds(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedIds(prev => ({ ...prev, [product.id]: false }));
        }, 1600);

        toast.success(`"${product.name}" ajouté au panier !`, {
            action: {
                label: 'Voir le panier',
                onClick: () => router.push('/cart')
            }
        });
    };

    const handleAddAllToCart = () => {
        const inStockItems = wishlist.filter(p => (p.stock ?? 0) > 0);
        if (inStockItems.length === 0) {
            toast.info("Aucun article en stock à ajouter au panier.");
            return;
        }

        inStockItems.forEach(product => {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price || 0,
                image: product.images?.[0] || product.image || '/placeholder.png',
                quantity: 1,
            });
        });

        toast.success(`${inStockItems.length} article${inStockItems.length > 1 ? 's' : ''} ajouté${inStockItems.length > 1 ? 's' : ''} au panier !`, {
            action: {
                label: 'Commander',
                onClick: () => router.push('/cart')
            }
        });
    };

    // Filtered wishlist items
    const filteredWishlist = useMemo(() => {
        return wishlist.filter((item: any) => {
            if (wishlistSearch.trim()) {
                const query = wishlistSearch.toLowerCase().trim();
                const nameMatch = item.name?.toLowerCase().includes(query);
                const catMatch = item.category?.name?.toLowerCase().includes(query);
                if (!nameMatch && !catMatch) return false;
            }

            if (wishlistFilter === 'instock') {
                return (item.stock ?? 0) > 0;
            }
            if (wishlistFilter === 'promo') {
                return Boolean(item.oldPrice && item.oldPrice > (item.price ?? 0));
            }

            return true;
        });
    }, [wishlist, wishlistSearch, wishlistFilter]);

    const inStockCount = useMemo(() => wishlist.filter(p => (p.stock ?? 0) > 0).length, [wishlist]);
    const promoCount = useMemo(() => wishlist.filter(p => p.oldPrice && p.oldPrice > (p.price ?? 0)).length, [wishlist]);
    const wishlistTotal = useMemo(() => wishlist.reduce((acc, p) => acc + (p.price || 0), 0), [wishlist]);

    // Notifications state
    const [clientNotifications, setClientNotifications] = useState<any[]>([]);
    const [notifUnreadCount, setNotifUnreadCount] = useState(0);

    const fetchClientNotifications = useCallback(async () => {
        try {
            const res = await fetch(`/api/notifications?_t=${Date.now()}`, {
                cache: 'no-store',
            });
            if (res.ok) {
                const data = await res.json();
                setClientNotifications(data.notifications || []);
                setNotifUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    useEffect(() => {
        fetchClientNotifications();
        const interval = setInterval(fetchClientNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchClientNotifications]);

    const handleMarkAllNotifRead = async () => {
        await markAllNotificationsRead();
        setClientNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setNotifUnreadCount(0);
        toast.success('Toutes les notifications ont été marquées comme lues.');
    };

    // User initials helper
    const userInitials = useMemo(() => {
        if (user.username && user.username.trim()) {
            const parts = user.username.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return user.username.trim().slice(0, 2).toUpperCase();
        }
        if (user.email) {
            return user.email.slice(0, 2).toUpperCase();
        }
        return 'BK';
    }, [user.username, user.email]);

    const menuItems = [
        { id: 'orders' as TabType, label: 'Mes commandes', icon: Package, badge: user.orders?.length || 0 },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell, badge: notifUnreadCount, isUrgentBadge: notifUnreadCount > 0 },
        { id: 'wishlist' as TabType, label: 'Coups de cœur', icon: Heart, badge: wishlist.length },
        { id: 'profile' as TabType, label: 'Mon profil', icon: UserIcon, badge: 0 },
        { id: 'settings' as TabType, label: 'Paramètres', icon: Settings, badge: 0 },
    ];

    const activeMenuItem = menuItems.find(item => item.id === activeTab) || menuItems[0];
    const ActiveIcon = activeMenuItem.icon;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.04 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 26 } }
    };

    return (
        <div className="w-full py-3 sm:py-6 md:py-10 pb-28 sm:pb-20 md:pb-16 relative flex-grow bg-[#FAFAFC] overflow-x-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-0 left-0 w-full h-[260px] sm:h-[320px] bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-transparent pointer-events-none" />

            <Container className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                
                {/* ================= MOBILE COMPACT HEADER (MOBILE FIRST) ================= */}
                <div className="lg:hidden mb-2.5 bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-[#1B1F3B] via-[#2A3158] to-orange-500 shrink-0 shadow-xs">
                                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.username || 'Avatar'}
                                            width={44}
                                            height={44}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-sm font-black bg-gradient-to-tr from-[#1B1F3B] to-orange-500 bg-clip-text text-transparent">
                                            {userInitials}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                            </div>

                            {/* User details */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h2 className="text-sm font-black text-[#1B1F3B] truncate leading-tight">
                                        {user.username || "Client Privilège"}
                                    </h2>
                                    {user.role === 'ADMIN' ? (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-orange-50 text-orange-700 border border-orange-100">
                                            VIP
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-[11px] truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        {/* Fast Actions on Mobile */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="h-8 sm:h-9 px-2 sm:px-2.5 bg-[#1B1F3B] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-orange-500 transition-colors shadow-xs active:scale-95"
                                    title="Panel Administrateur"
                                >
                                    <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors active:scale-95"
                                title="Déconnexion"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= MOBILE NAVIGATION DROPDOWN (MOBILE FIRST) ================= */}
                <div ref={dropdownRef} className="lg:hidden relative mb-3.5 z-30">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="w-full bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200/90 shadow-xs flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] touch-manipulation focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        aria-expanded={isDropdownOpen}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <ActiveIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">
                                    Section active
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-[#1B1F3B] truncate">
                                        {activeMenuItem.label}
                                    </span>
                                    {activeMenuItem.badge > 0 && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 text-[10px] font-black rounded-full leading-none",
                                            activeMenuItem.isUrgentBadge ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {activeMenuItem.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            "w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-transform duration-200 shrink-0",
                            isDropdownOpen && "rotate-180 bg-orange-50 text-orange-600"
                        )}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Dropdown Menu Popup */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.16 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-[#1B1F3B]/10 overflow-hidden z-50 p-1.5"
                            >
                                <div className="flex flex-col gap-0.5">
                                    {menuItems.map((item) => {
                                        const isSelected = activeTab === item.id;
                                        const ItemIcon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    handleTabChange(item.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all text-left active:scale-[0.99] touch-manipulation",
                                                    isSelected
                                                        ? "bg-orange-50/80 text-orange-600 font-bold"
                                                        : "text-gray-600 hover:text-[#1B1F3B] hover:bg-gray-50 font-medium"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                        isSelected ? "bg-orange-500 text-white" : "bg-gray-100/80 text-gray-400"
                                                    )}>
                                                        <ItemIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs sm:text-sm truncate">{item.label}</span>
                                                    {item.badge > 0 && (
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none",
                                                            isSelected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                                                        )}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-orange-600 stroke-[3] shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ================= MAIN GRID (DESKTOP SIDEBAR + RESPONSIVE CONTENT) ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

                    {/* Left Sidebar (Desktop Only) */}
                    <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 lg:sticky lg:top-24 self-start">

                        {/* Desktop Profile Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col items-center text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-orange-50/70 to-transparent pointer-events-none" />

                            {/* Avatar Monogram */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#1B1F3B] via-[#2A3158] to-orange-500 shadow-md shadow-orange-500/10 mb-4 z-10"
                            >
                                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.username || 'Avatar'}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-xl font-black bg-gradient-to-tr from-[#1B1F3B] to-orange-500 bg-clip-text text-transparent tracking-tight">
                                            {userInitials}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="En ligne">
                                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </div>
                            </motion.div>

                            <h2 className="text-lg font-black text-[#1B1F3B] tracking-tight mb-0.5 relative z-10">
                                {user.username || "Client Privilège"}
                            </h2>
                            <p className="text-gray-400 text-xs font-medium mb-3 relative z-10 truncate max-w-full">
                                {user.email}
                            </p>

                            {/* Role / Status Badge */}
                            {user.role === 'ADMIN' ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-xs mb-4">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Administrateur</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200/60 shadow-xs mb-4">
                                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Client Privilégié</span>
                                </div>
                            )}

                            {/* Quick Stats Micro-bar */}
                            <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-gray-100 text-left">
                                <button
                                    onClick={() => handleTabChange('orders')}
                                    className="bg-gray-50/70 hover:bg-orange-50/40 rounded-2xl p-3 border border-gray-100 transition-colors text-left"
                                >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Commandes</span>
                                    <span className="text-base font-black text-[#1B1F3B]">{user.orders?.length || 0}</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange('wishlist')}
                                    className="bg-gray-50/70 hover:bg-orange-50/40 rounded-2xl p-3 border border-gray-100 transition-colors text-left"
                                >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Coups de cœur</span>
                                    <span className="text-base font-black text-orange-600">{wishlist.length}</span>
                                </button>
                            </div>

                            {/* Admin Panel Direct Link */}
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="mt-4 w-full h-11 bg-gradient-to-r from-[#1B1F3B] to-[#252b52] hover:from-orange-500 hover:to-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#1B1F3B]/10 hover:shadow-orange-500/20 active:scale-[0.98] group/btn"
                                >
                                    <Settings className="w-3.5 h-3.5 group-hover/btn:rotate-45 transition-transform duration-300" />
                                    <span>Panel Administrateur</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                                </Link>
                            )}
                        </motion.div>

                        {/* Desktop Menu Navigation Card */}
                        <motion.nav
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="bg-white rounded-3xl p-3 border border-gray-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col gap-1.5"
                        >
                            {menuItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id)}
                                        className={cn(
                                            "relative w-full px-4 py-3 flex items-center gap-3.5 transition-all duration-200 rounded-2xl group outline-none text-left",
                                            isActive
                                                ? "text-orange-600 font-bold"
                                                : "text-gray-500 hover:text-[#1B1F3B] hover:bg-gray-50/80 font-medium"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-account-tab-pill"
                                                className="absolute inset-0 bg-orange-50/80 rounded-2xl border border-orange-100/60 shadow-xs"
                                                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                            />
                                        )}
                                        <div className="relative z-10 flex items-center gap-3 w-full">
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                                isActive ? "bg-orange-500 text-white shadow-xs" : "bg-gray-50 text-gray-400 group-hover:text-[#1B1F3B] group-hover:bg-gray-100"
                                            )}>
                                                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                            </div>
                                            <span className="text-sm flex-1 tracking-tight">{item.label}</span>
                                            {item.badge > 0 && (
                                                <span className={cn(
                                                    "min-w-[20px] h-[20px] px-1.5 text-[10px] font-black rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
                                                    isActive
                                                        ? "bg-orange-500 text-white"
                                                        : item.isUrgentBadge
                                                            ? "bg-orange-500 text-white animate-pulse"
                                                            : "bg-gray-100 text-gray-500"
                                                )}>
                                                    {item.badge > 99 ? '99+' : item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            <div className="mx-3 my-2 h-px bg-gray-100" />

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full px-4 py-3 flex items-center gap-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-2xl transition-all duration-200 group text-left"
                            >
                                <div className="w-8 h-8 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-colors">
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Déconnexion</span>
                            </button>
                        </motion.nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18 }}
                                className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 border border-gray-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] min-h-[420px] sm:min-h-[520px]"
                            >
                                
                                {/* ---------------- TAB: COUPS DE CŒUR (WISHLIST) ---------------- */}
                                {activeTab === 'wishlist' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3.5 sm:gap-5">
                                        
                                        {/* Header section with responsive summary */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5 sm:pb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-xl sm:text-2xl font-black text-[#1B1F3B] tracking-tight">
                                                        Coups de cœur
                                                    </h3>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-50 text-orange-600 border border-orange-100/60">
                                                        {wishlist.length}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {wishlist.length > 0
                                                        ? `${wishlist.length} article${wishlist.length > 1 ? 's' : ''} sauvegardé${wishlist.length > 1 ? 's' : ''} • Valeur : ${wishlistTotal.toLocaleString()} FCFA`
                                                        : "Articles que vous avez mis de côté."
                                                    }
                                                </p>
                                            </div>

                                            {wishlist.length > 0 && inStockCount > 0 && (
                                                <button
                                                    onClick={handleAddAllToCart}
                                                    className="w-full sm:w-auto h-10 px-4 bg-[#1B1F3B] hover:bg-orange-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all touch-manipulation"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    <span>Tout ajouter ({inStockCount})</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Mobile-Friendly Search & Filter Strip */}
                                        {wishlist.length > 0 && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                                {/* Search Input */}
                                                <div className="relative flex-1">
                                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={wishlistSearch}
                                                        onChange={(e) => setWishlistSearch(e.target.value)}
                                                        placeholder="Rechercher parmi vos favoris..."
                                                        className="w-full pl-9 pr-8 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200/70 focus:border-orange-500 rounded-xl text-xs font-medium text-[#1B1F3B] outline-none transition-all placeholder:text-gray-400"
                                                    />
                                                    {wishlistSearch && (
                                                        <button
                                                            onClick={() => setWishlistSearch('')}
                                                            className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Filter Chips */}
                                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                                                    <button
                                                        onClick={() => setWishlistFilter('all')}
                                                        className={cn(
                                                            "px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors active:scale-95",
                                                            wishlistFilter === 'all'
                                                                ? "bg-[#1B1F3B] text-white shadow-xs"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                                                        )}
                                                    >
                                                        Tous ({wishlist.length})
                                                    </button>
                                                    <button
                                                        onClick={() => setWishlistFilter('instock')}
                                                        className={cn(
                                                            "px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors active:scale-95",
                                                            wishlistFilter === 'instock'
                                                                ? "bg-emerald-600 text-white shadow-xs"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                                                        )}
                                                    >
                                                        En stock ({inStockCount})
                                                    </button>
                                                    {promoCount > 0 && (
                                                        <button
                                                            onClick={() => setWishlistFilter('promo')}
                                                            className={cn(
                                                                "px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors active:scale-95",
                                                                wishlistFilter === 'promo'
                                                                    ? "bg-rose-600 text-white shadow-xs"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                                                            )}
                                                        >
                                                            Promotions ({promoCount})
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products Grid */}
                                        {filteredWishlist.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-4.5">
                                                {filteredWishlist.map((product: any) => {
                                                    const displayImage = product.images?.[0] || product.image || '/placeholder.png';
                                                    const categoryName = product.category?.name || 'Article';
                                                    const hasStock = (product.stock ?? 0) > 0;
                                                    const price = product.price ?? 0;
                                                    const oldPrice = product.oldPrice;
                                                    const hasDiscount = oldPrice && oldPrice > price;
                                                    const discountPct = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
                                                    const isAdded = Boolean(addedIds[product.id]);

                                                    return (
                                                        <motion.div
                                                            key={product.id}
                                                            layout
                                                            variants={itemVariants}
                                                            className="group relative bg-white border border-gray-100 hover:border-orange-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                                                        >
                                                            <div className="flex gap-3 sm:gap-3.5">
                                                                {/* Thumbnail */}
                                                                <Link
                                                                    href={`/product/${product.slug || product.id}`}
                                                                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50/80 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1.5 group-hover:border-orange-100 transition-colors"
                                                                >
                                                                    <WatermarkOverlay logoUrl={headerLogo} isCard />
                                                                    <Image
                                                                        src={displayImage}
                                                                        alt={product.name}
                                                                        fill
                                                                        sizes="(max-width: 640px) 80px, 96px"
                                                                        className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300 z-10"
                                                                        unoptimized
                                                                    />
                                                                    {hasDiscount && (
                                                                        <span className="absolute top-1 left-1 z-20 px-1 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black shadow-xs">
                                                                            -{discountPct}%
                                                                        </span>
                                                                    )}
                                                                </Link>

                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                                    <div>
                                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider truncate">
                                                                                {categoryName}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleRemoveWishlist(product.id, product.name)}
                                                                                title="Retirer des coups de cœur"
                                                                                className="w-7 h-7 -mr-1 -mt-1 rounded-full bg-gray-50/80 hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors shrink-0 active:scale-95"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>

                                                                        <Link
                                                                            href={`/product/${product.slug || product.id}`}
                                                                            className="font-bold text-xs sm:text-sm text-[#1B1F3B] hover:text-orange-600 transition-colors line-clamp-2 leading-snug mb-1 block"
                                                                        >
                                                                            {product.name}
                                                                        </Link>
                                                                    </div>

                                                                    {/* Price & Stock */}
                                                                    <div>
                                                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                                                            <span className="text-sm sm:text-base font-black text-[#1B1F3B] tracking-tight">
                                                                                {price.toLocaleString()} <span className="text-[10px] font-bold text-gray-500">FCFA</span>
                                                                            </span>
                                                                            {hasDiscount && (
                                                                                <span className="text-[11px] text-gray-400 line-through font-medium">
                                                                                    {oldPrice.toLocaleString()} FCFA
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="mt-0.5 flex items-center gap-1.5">
                                                                            {hasStock ? (
                                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                                    En stock
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                                                    Rupture
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Footer (Touch friendly & Added State) */}
                                                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleAddToCart(product)}
                                                                    disabled={!hasStock}
                                                                    className={cn(
                                                                        "flex-1 h-9 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation select-none",
                                                                        isAdded
                                                                            ? "bg-emerald-600 text-white"
                                                                            : hasStock
                                                                                ? "bg-[#1B1F3B] hover:bg-orange-500 text-white shadow-xs"
                                                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    {isAdded ? (
                                                                        <>
                                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                            <span>Ajouté !</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                                            <span>{hasStock ? 'Ajouter' : 'Indisponible'}</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <Link
                                                                    href={`/product/${product.slug || product.id}`}
                                                                    className="h-9 px-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-bold flex items-center justify-center gap-1 transition-colors touch-manipulation active:scale-95"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>Voir</span>
                                                                </Link>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : wishlist.length > 0 ? (
                                            /* No search/filter match */
                                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2.5 text-gray-400">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-[#1B1F3B] mb-1">Aucun article ne correspond à votre filtre</p>
                                                <p className="text-xs text-gray-400 mb-4">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
                                                <button
                                                    onClick={() => { setWishlistSearch(''); setWishlistFilter('all'); }}
                                                    className="h-9 px-4 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold flex items-center gap-1.5 hover:bg-orange-100 transition-colors"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Réinitialiser les filtres</span>
                                                </button>
                                            </div>
                                        ) : (
                                            /* Truly empty wishlist */
                                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-rose-50 to-orange-50 border border-orange-100/60 flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
                                                    <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-rose-400" />
                                                </div>
                                                <h4 className="text-base font-black text-[#1B1F3B] mb-1">Votre liste de coups de cœur est vide</h4>
                                                <p className="text-gray-400 text-xs max-w-sm mb-5 leading-relaxed px-4">
                                                    Parcourez notre catalogue et cliquez sur le cœur pour mettre de côté vos articles préférés.
                                                </p>
                                                <Link
                                                    href="/store"
                                                    className="h-11 px-6 bg-[#1B1F3B] hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 touch-manipulation"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>Découvrir la boutique</span>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ---------------- TAB: NOTIFICATIONS ---------------- */}
                                {activeTab === 'notifications' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3.5 sm:gap-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5 sm:pb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-xl sm:text-2xl font-black text-[#1B1F3B] tracking-tight">Notifications</h3>
                                                    {notifUnreadCount > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-50 text-orange-600 border border-orange-100/60">
                                                            {notifUnreadCount} nouvelle{notifUnreadCount > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">Suivez l'avancement de vos commandes en temps réel.</p>
                                            </div>
                                            {notifUnreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllNotifRead}
                                                    className="w-full sm:w-auto text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/70 px-3.5 py-2 rounded-xl transition-colors text-center active:scale-95"
                                                >
                                                    Tout marquer comme lu
                                                </button>
                                            )}
                                        </div>

                                        {clientNotifications.length > 0 ? (
                                            <div className="flex flex-col gap-2.5 sm:gap-3">
                                                {clientNotifications.map((notif: any) => {
                                                    const typeConfig: Record<string, { icon: any; bg: string; color: string }> = {
                                                        ORDER_CREATED: { icon: Package, bg: 'bg-violet-50 text-violet-600', color: 'border-violet-100' },
                                                        ORDER_PROCESSING: { icon: History, bg: 'bg-blue-50 text-blue-600', color: 'border-blue-100' },
                                                        ORDER_SHIPPED: { icon: Truck, bg: 'bg-orange-50 text-orange-600', color: 'border-orange-100' },
                                                        ORDER_DELIVERED: { icon: PackageCheck, bg: 'bg-emerald-50 text-emerald-600', color: 'border-emerald-100' },
                                                        ORDER_CANCELLED: { icon: XCircle, bg: 'bg-rose-50 text-rose-600', color: 'border-rose-100' },
                                                    };
                                                    const config = typeConfig[notif.type] || { icon: Bell, bg: 'bg-gray-50 text-gray-600', color: 'border-gray-100' };
                                                    const NotifIcon = config.icon;
                                                    const timeAgo = notif.createdAt
                                                        ? (() => {
                                                            const diffMs = Date.now() - new Date(notif.createdAt).getTime();
                                                            const diffMin = Math.floor(diffMs / 60000);
                                                            const diffHours = Math.floor(diffMin / 60);
                                                            const diffDays = Math.floor(diffHours / 24);
                                                            if (diffMin < 1) return "À l'instant";
                                                            if (diffMin < 60) return `Il y a ${diffMin} min`;
                                                            if (diffHours < 24) return `Il y a ${diffHours} h`;
                                                            if (diffDays < 7) return `Il y a ${diffDays} j`;
                                                            return new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                                                        })()
                                                        : '';

                                                    return (
                                                        <motion.div key={notif.id} variants={itemVariants}>
                                                            <div className={cn(
                                                                "p-3 sm:p-3.5 rounded-2xl border transition-all duration-200",
                                                                !notif.isRead
                                                                    ? "bg-orange-50/40 border-orange-100 shadow-xs"
                                                                    : "bg-white border-gray-100 hover:border-gray-200"
                                                            )}>
                                                                <div className="flex gap-3 items-start">
                                                                    <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border", config.bg, config.color)}>
                                                                        <NotifIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={cn(
                                                                            "text-xs sm:text-sm line-clamp-1",
                                                                            !notif.isRead ? "font-bold text-[#1B1F3B]" : "font-medium text-gray-700"
                                                                        )}>
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{timeAgo}</p>
                                                                    </div>
                                                                    {!notif.isRead && (
                                                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0 animate-pulse" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                                                    <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-bold text-[#1B1F3B] mb-1">Aucune notification</p>
                                                <p className="text-gray-400 text-xs">Les alertes et mises à jour apparaîtront ici.</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ---------------- TAB: HISTORIQUE DES COMMANDES ---------------- */}
                                {activeTab === 'orders' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3.5 sm:gap-5">
                                        <div className="border-b border-gray-100 pb-3.5 sm:pb-4">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-xl sm:text-2xl font-black text-[#1B1F3B] tracking-tight">Historique des commandes</h3>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-gray-100 text-gray-600">
                                                    {user.orders?.length || 0}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">Suivez l'état et retrouvez le détail de vos commandes.</p>
                                        </div>

                                        {user.orders && user.orders.length > 0 ? (
                                            <div className="flex flex-col gap-3 sm:gap-4">
                                                {user.orders.map((order: any) => (
                                                    <motion.div key={order.id} variants={itemVariants}>
                                                        <OrderCard order={order} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                                                    <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-bold text-[#1B1F3B] mb-1">Aucune commande pour le moment</p>
                                                <p className="text-gray-400 text-xs mb-5 px-4">Vous n'avez pas encore passé de commande avec ce compte.</p>
                                                <Link
                                                    href="/store"
                                                    className="h-11 px-6 bg-[#1B1F3B] hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 touch-manipulation"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>Découvrir la boutique</span>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ---------------- TAB: MON PROFIL ---------------- */}
                                {activeTab === 'profile' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                                        
                                        {/* Header with Title & Metadata */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 sm:pb-5">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl sm:text-2xl font-black text-[#1B1F3B] tracking-tight">
                                                        Mon profil
                                                    </h3>
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1 shadow-2xs">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Compte vérifié
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Gérez vos informations personnelles et votre adresse de livraison par défaut.
                                                </p>
                                            </div>

                                            {user.createdAt && (
                                                <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 font-medium flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unsaved changes alert strip */}
                                        <AnimatePresence>
                                            {isProfileDirty && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs shadow-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                                        <span className="font-bold">Modifications non enregistrées sur votre profil</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleResetProfile}
                                                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-950 underline underline-offset-2 shrink-0"
                                                    >
                                                        Annuler les changements
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Form Body */}
                                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                                            
                                            {/* Section 1: Informations Personnelles */}
                                            <div className="flex flex-col gap-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                        <UserIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[#1B1F3B]">Informations personnelles</h4>
                                                        <p className="text-[11px] text-gray-400">Vos coordonnées principales pour vos commandes et livraisons.</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Nom complet */}
                                                    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-[#1B1F3B]">
                                                            Nom complet
                                                        </label>
                                                        <div className="relative group focus-within:ring-2 focus-within:ring-orange-500/15 rounded-xl transition-all">
                                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 w-4 h-4 transition-colors" />
                                                            <input
                                                                type="text"
                                                                autoComplete="name"
                                                                value={profileData.username}
                                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                                className="w-full h-11 pl-10 pr-4 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-orange-500 rounded-xl outline-none transition-all text-sm font-semibold text-[#1B1F3B] placeholder:text-gray-300"
                                                                placeholder="Ex: Cheikhou Omar Touré"
                                                            />
                                                        </div>
                                                        <span className="text-[11px] text-gray-400">Visible sur vos factures et récapitulatifs.</span>
                                                    </motion.div>

                                                    {/* Téléphone */}
                                                    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-[#1B1F3B]">
                                                            Numéro de téléphone
                                                        </label>
                                                        <div className="relative group focus-within:ring-2 focus-within:ring-orange-500/15 rounded-xl transition-all">
                                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 w-4 h-4 transition-colors" />
                                                            <input
                                                                type="tel"
                                                                autoComplete="tel"
                                                                value={profileData.phone}
                                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                                className="w-full h-11 pl-10 pr-4 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-orange-500 rounded-xl outline-none transition-all text-sm font-semibold text-[#1B1F3B] placeholder:text-gray-300"
                                                                placeholder="+221 77 000 00 00"
                                                            />
                                                        </div>
                                                        <span className="text-[11px] text-gray-400">Requis pour vous joindre lors de la livraison.</span>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Section 2: Adresse de Livraison par Défaut */}
                                            <div className="flex flex-col gap-3.5 pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[#1B1F3B]">Adresse de livraison</h4>
                                                        <p className="text-[11px] text-gray-400">Coordonnées géographiques utilisées pour pré-remplir la commande.</p>
                                                    </div>
                                                </div>

                                                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-[#1B1F3B]">
                                                        Adresse complète de livraison
                                                    </label>
                                                    <div className="relative group focus-within:ring-2 focus-within:ring-orange-500/15 rounded-xl transition-all">
                                                        <MapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-orange-500 w-4 h-4 transition-colors" />
                                                        <textarea
                                                            rows={3}
                                                            autoComplete="street-address"
                                                            value={profileData.address}
                                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-orange-500 rounded-xl outline-none transition-all text-sm font-medium text-[#1B1F3B] resize-none placeholder:text-gray-300 leading-relaxed"
                                                            placeholder="Ex: Quartier Mermoz, Villa n°12, près de la pharmacie, Dakar, Sénégal"
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-gray-400">Indiquez des repères précis (quartier, point de repère, ville) pour faciliter l'acheminement.</span>
                                                </motion.div>
                                            </div>

                                            {/* Section 3: Sécurité & Statut du Compte */}
                                            <div className="flex flex-col gap-3.5 pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[#1B1F3B]">Sécurité & Statut du compte</h4>
                                                        <p className="text-[11px] text-gray-400">Paramètres d'authentification et privilèges associés.</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Read-only email input */}
                                                    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-bold text-[#1B1F3B]">
                                                                Adresse email principale
                                                            </label>
                                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                                <Check className="w-3 h-3 stroke-[3]" /> Vérifiée
                                                            </span>
                                                        </div>
                                                        <div className="relative rounded-xl bg-gray-100/70 border border-gray-200/80 h-11 flex items-center">
                                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                            <input
                                                                type="email"
                                                                value={user.email || ''}
                                                                disabled
                                                                className="w-full h-full pl-10 pr-10 bg-transparent rounded-xl text-sm font-semibold text-gray-600 cursor-not-allowed select-none"
                                                            />
                                                            <span title="Email sécurisé non modifiable directement" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                                <Lock className="w-3.5 h-3.5" />
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400">Identifiant unique lié à votre authentification.</span>
                                                    </motion.div>

                                                    {/* Role / Account status card */}
                                                    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-[#1B1F3B]">
                                                            Type de compte & Accès
                                                        </label>
                                                        <div className="flex items-center justify-between px-3.5 bg-gray-50/80 border border-gray-200 rounded-xl h-11">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-orange-500" />
                                                                <span className="text-xs font-bold text-[#1B1F3B]">
                                                                    {user.role === 'ADMIN' ? 'Compte Administrateur' : 'Compte Client Privilégié'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs">
                                                                Actif
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400">Privilèges et autorisations configurés automatiquement.</span>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <motion.div variants={itemVariants} className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {isProfileDirty ? (
                                                        <span className="flex items-center gap-1.5 font-bold text-amber-700">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                            Modifications prêtes à être enregistrées
                                                        </span>
                                                    ) : isSavedRecently ? (
                                                        <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                            Profil mis à jour avec succès
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 font-medium text-gray-400">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                                                            Vos informations sont à jour
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2.5">
                                                    {isProfileDirty && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetProfile}
                                                            disabled={isUpdating}
                                                            className="w-full sm:w-auto px-4 h-11 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors active:scale-95 touch-manipulation"
                                                        >
                                                            Annuler
                                                        </button>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        disabled={isUpdating || !isProfileDirty}
                                                        className={cn(
                                                            "w-full sm:w-auto px-6 h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 touch-manipulation shadow-xs",
                                                            isSavedRecently
                                                                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                                                                : isProfileDirty
                                                                    ? "bg-[#1B1F3B] hover:bg-orange-500 text-white shadow-[#1B1F3B]/10 hover:shadow-orange-500/20"
                                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {isUpdating ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                <span>Enregistrement...</span>
                                                            </>
                                                        ) : isSavedRecently ? (
                                                            <>
                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                                <span>Enregistré !</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4" />
                                                                <span>Enregistrer les modifications</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ---------------- TAB: PARAMÈTRES & SÉCURITÉ ---------------- */}
                                {activeTab === 'settings' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4 sm:gap-6">
                                        <div className="border-b border-gray-100 pb-3.5 sm:pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <h3 className="text-xl sm:text-2xl font-black text-[#1B1F3B] tracking-tight mb-0.5">Paramètres & Sécurité</h3>
                                                <p className="text-xs text-gray-500">Gérez la sécurité de votre compte et vos préférences de contact conformément aux normes de sécurité.</p>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-800 text-xs font-semibold self-start sm:self-auto">
                                                <ShieldCheck className="w-4 h-4 text-orange-600" />
                                                <span>Normes ANSSI / OWASP</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                                            {/* Security Card */}
                                            <motion.div variants={itemVariants} className="bg-gray-50/70 rounded-2xl p-4 sm:p-6 border border-gray-100 flex flex-col justify-between shadow-xs">
                                                <form onSubmit={handleChangePassword} className="space-y-4">
                                                    {/* Card Header */}
                                                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                                <Lock className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-[#1B1F3B] text-sm sm:text-base">Sécurité du compte</h4>
                                                                <p className="text-[11px] text-gray-500">Mise à jour sécurisée du mot de passe</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Inputs */}
                                                    <div className="space-y-3.5">
                                                        {/* Current Password */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[11px] font-bold text-gray-700">
                                                                    Mot de passe actuel <span className="text-orange-500">*</span>
                                                                </label>
                                                                <span className="text-[10px] text-gray-400">Re-authentification requise</span>
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type={showCurrentPassword ? "text" : "password"}
                                                                    value={currentPassword}
                                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                                    placeholder="••••••••••••"
                                                                    required
                                                                    autoComplete="current-password"
                                                                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all font-medium"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                                                                    tabIndex={-1}
                                                                    aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                                                >
                                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* New Password */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[11px] font-bold text-gray-700">
                                                                    Nouveau mot de passe <span className="text-orange-500">*</span>
                                                                </label>
                                                                {newPassword && (
                                                                    <span className={cn("text-[10px] font-bold", strengthConfig.text)}>
                                                                        Force : {strengthConfig.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    placeholder="••••••••••••"
                                                                    required
                                                                    autoComplete="new-password"
                                                                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all font-medium"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                                                                    tabIndex={-1}
                                                                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                                                >
                                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>

                                                            {/* Strength Gauge */}
                                                            {newPassword && (
                                                                <div className="mt-1 space-y-1">
                                                                    <div className="flex gap-1.5 h-1.5 w-full">
                                                                        {[1, 2, 3, 4].map((step) => (
                                                                            <div
                                                                                key={step}
                                                                                className={cn(
                                                                                    "flex-1 rounded-full transition-all duration-300",
                                                                                    step <= strengthConfig.level ? strengthConfig.color : "bg-gray-200"
                                                                                )}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Warning if same as current */}
                                                            {isSameAsCurrent && (
                                                                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-1">
                                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                                                    <span>Le nouveau mot de passe doit être différent du mot de passe actuel.</span>
                                                                </div>
                                                            )}

                                                            {/* Criteria Checklist */}
                                                            <div className="mt-2 p-2.5 sm:p-3 bg-white rounded-xl border border-gray-100 space-y-1.5">
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Normes de robustesse requises :</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {passwordCriteria.minLength ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            </div>
                                                                        )}
                                                                        <span className={cn("text-[11px]", passwordCriteria.minLength ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                                                                            Au moins 8 caractères
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5">
                                                                        {passwordCriteria.hasUpper ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            </div>
                                                                        )}
                                                                        <span className={cn("text-[11px]", passwordCriteria.hasUpper ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                                                                            1 majuscule (A-Z)
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5">
                                                                        {passwordCriteria.hasLower ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            </div>
                                                                        )}
                                                                        <span className={cn("text-[11px]", passwordCriteria.hasLower ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                                                                            1 minuscule (a-z)
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5">
                                                                        {passwordCriteria.hasNumber ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            </div>
                                                                        )}
                                                                        <span className={cn("text-[11px]", passwordCriteria.hasNumber ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                                                                            1 chiffre (0-9)
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5 sm:col-span-2">
                                                                        {passwordCriteria.hasSpecial ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            </div>
                                                                        )}
                                                                        <span className={cn("text-[11px]", passwordCriteria.hasSpecial ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                                                                            1 caractère spécial (!@#$%^&*...)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Confirm Password */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[11px] font-bold text-gray-700">
                                                                    Confirmer le mot de passe <span className="text-orange-500">*</span>
                                                                </label>
                                                                {confirmPassword && (
                                                                    <span className={cn("text-[10px] font-bold flex items-center gap-1", passwordsMatch ? "text-emerald-600" : "text-rose-500")}>
                                                                        {passwordsMatch ? (
                                                                            <>
                                                                                <Check className="w-3 h-3" /> Correspondance valide
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <X className="w-3 h-3" /> Ne correspond pas
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                    placeholder="••••••••••••"
                                                                    required
                                                                    autoComplete="new-password"
                                                                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all font-medium"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                                                                    tabIndex={-1}
                                                                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Security reassurance banner */}
                                                    <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center gap-2 text-[10px] text-gray-500">
                                                        <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
                                                        <span>Chiffrement Bcrypt et protection anti-bruteforce active.</span>
                                                    </div>

                                                    {/* Action Button */}
                                                    <button
                                                        type="submit"
                                                        disabled={!canSubmitPassword || isChangingPassword}
                                                        className={cn(
                                                            "w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-manipulation active:scale-98 shadow-xs",
                                                            passwordSuccess
                                                                ? "bg-emerald-600 text-white"
                                                                : canSubmitPassword
                                                                    ? "bg-[#1B1F3B] hover:bg-orange-500 text-white shadow-[#1B1F3B]/10 hover:shadow-orange-500/20"
                                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                        )}
                                                    >
                                                        {isChangingPassword ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                <span>Mise à jour sécurisée en cours...</span>
                                                            </>
                                                        ) : passwordSuccess ? (
                                                            <>
                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                                <span>Mot de passe mis à jour !</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="w-4 h-4" />
                                                                <span>Mettre à jour le mot de passe</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </form>
                                            </motion.div>

                                            {/* Preferences */}
                                            <motion.div variants={itemVariants} className="bg-gray-50/70 rounded-2xl p-4 sm:p-6 border border-gray-100 flex flex-col justify-between shadow-xs">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3.5 border-b border-gray-100 pb-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                            <Bell className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#1B1F3B] text-sm sm:text-base">Notifications & Alertes</h4>
                                                            <p className="text-[11px] text-gray-500">Canaux de communication souhaités</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="flex items-center justify-between cursor-pointer p-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors touch-manipulation select-none">
                                                            <div>
                                                                <span className="text-xs font-bold text-gray-700 block">Emails promotionnels</span>
                                                                <span className="text-[11px] text-gray-400">Offres exclusives, nouveautés & ventes flash</span>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={emailNotifs}
                                                                onChange={(e) => setEmailNotifs(e.target.checked)}
                                                            />
                                                            <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-orange-500 relative shrink-0"></div>
                                                        </label>

                                                        <label className="flex items-center justify-between cursor-pointer p-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors touch-manipulation select-none">
                                                            <div>
                                                                <span className="text-xs font-bold text-gray-700 block">Alertes de commande (SMS)</span>
                                                                <span className="text-[11px] text-gray-400">Suivi d'expédition et alertes livraison en direct</span>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={smsNotifs}
                                                                onChange={(e) => setSmsNotifs(e.target.checked)}
                                                            />
                                                            <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-orange-500 relative shrink-0"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSavePreferences}
                                                    disabled={isSavingPreferences}
                                                    className="mt-4 w-full h-11 bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 rounded-xl text-xs font-bold transition-colors touch-manipulation active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {isSavingPreferences ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                                            <span>Enregistrement...</span>
                                                        </>
                                                    ) : (
                                                        <span>Enregistrer les préférences</span>
                                                    )}
                                                </button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </Container>
        </div>
    );
}

// ---------------- ORDER CARD COMPONENT (WITH TRACKING PROGRESS BAR) ----------------
function OrderCard({ order }: { order: any }) {
    const [expanded, setExpanded] = useState(false);

    const statusConfig: Record<string, { label: string; color: string; bg: string; step: number; icon: any }> = {
        PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/80', step: 1, icon: Clock },
        PROCESSING: { label: 'En préparation', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200/80', step: 2, icon: History },
        SHIPPED: { label: 'En livraison', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200/80', step: 3, icon: Truck },
        DELIVERED: { label: 'Livrée', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/80', step: 4, icon: PackageCheck },
        CANCELLED: { label: 'Annulée', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200/80', step: 0, icon: XCircle },
    };

    const config = statusConfig[order.status] || statusConfig.PENDING;
    const StatusIcon = config.icon;
    const items = order.items || order.orderItems || [];
    const currentStep = config.step;

    const steps = [
        { label: 'Reçue', stepNum: 1 },
        { label: 'Préparation', stepNum: 2 },
        { label: 'Livraison', stepNum: 3 },
        { label: 'Livrée', stepNum: 4 },
    ];

    return (
        <div className="bg-white border border-gray-100 hover:border-orange-200/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-xs hover:shadow-sm">
            <div
                className="p-3 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none touch-manipulation"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-[#1B1F3B] shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-black text-[#1B1F3B] uppercase">
                                #{order.id.slice(0, 8)}
                            </span>
                            <div className={cn("px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border", config.bg, config.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{items.length} art.</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 border-t border-gray-100 md:border-t-0 pt-2.5 md:pt-0">
                    <div className="text-left md:text-right">
                        <span className="text-[10px] sm:text-xs text-gray-400 block font-medium">Total</span>
                        <span className="text-base sm:text-lg font-black text-[#1B1F3B] tracking-tight">
                            {order.total.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-gray-500">FCFA</span>
                        </span>
                    </div>
                    <button
                        className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 shrink-0",
                            expanded && "rotate-180 bg-orange-50 text-orange-600"
                        )}
                        aria-label="Afficher les détails"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-50/60 border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-3.5 sm:p-5 flex flex-col gap-3.5">
                            
                            {/* Order Stepper Progress Tracking (Mobile & Desktop) */}
                            {currentStep > 0 && (
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                                        Suivi de la livraison
                                    </span>
                                    <div className="flex items-center justify-between relative">
                                        {/* Connecting background line */}
                                        <div className="absolute left-3 right-3 top-3 h-0.5 bg-gray-200 -z-0" />
                                        {/* Filled progress line */}
                                        <div
                                            className="absolute left-3 top-3 h-0.5 bg-orange-500 -z-0 transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100))}%`
                                            }}
                                        />

                                        {steps.map((st) => {
                                            const isDone = currentStep >= st.stepNum;
                                            const isCurrent = currentStep === st.stepNum;
                                            return (
                                                <div key={st.stepNum} className="flex flex-col items-center gap-1 z-10">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                                        isCurrent
                                                            ? "bg-orange-500 text-white ring-4 ring-orange-100"
                                                            : isDone
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-white border-2 border-gray-200 text-gray-400"
                                                    )}>
                                                        {isDone && !isCurrent ? <Check className="w-3 h-3 stroke-[3]" /> : st.stepNum}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[9px] sm:text-[10px] font-bold text-center",
                                                        isCurrent ? "text-orange-600" : isDone ? "text-gray-700" : "text-gray-400"
                                                    )}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Articles commandés
                            </h5>

                            {items.length > 0 ? (
                                <div className="space-y-2">
                                    {items.map((item: any, idx: number) => {
                                        const productImg = item.product?.images?.[0] || item.product?.image || '/placeholder.png';
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs sm:text-sm bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 gap-2.5"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                                        <Image
                                                            src={productImg}
                                                            alt={item.product?.name || "Produit"}
                                                            fill
                                                            sizes="48px"
                                                            className="object-contain p-1"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={item.product?.id ? `/product/${item.product.id}` : '#'}
                                                            className="font-bold text-[#1B1F3B] hover:text-orange-600 transition-colors truncate block"
                                                        >
                                                            {item.product?.name || "Article indisponible"}
                                                        </Link>
                                                        <span className="text-[11px] text-gray-400">
                                                            Qté : <strong className="text-gray-700">{item.quantity}</strong>
                                                            {item.selectedColor && ` • ${item.selectedColor}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-[#1B1F3B] whitespace-nowrap text-right text-xs sm:text-sm">
                                                    {(item.price * item.quantity).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">Détails des articles non disponibles.</p>
                            )}

                            {/* Order Details Footer */}
                            {(order.deliveryMethod || order.deliveryZone || order.paymentMethod) && (
                                <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-2.5 sm:gap-4 text-[11px] text-gray-500">
                                    {order.deliveryMethod && (
                                        <span>Livraison : <strong className="text-[#1B1F3B]">{order.deliveryMethod}</strong></span>
                                    )}
                                    {order.deliveryZone && (
                                        <span>Zone : <strong className="text-[#1B1F3B]">{order.deliveryZone}</strong></span>
                                    )}
                                    {order.paymentMethod && (
                                        <span>Règlement : <strong className="text-[#1B1F3B]">{order.paymentMethod === 'cash' ? 'Paiement à la livraison' : order.paymentMethod}</strong></span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        Paiement :{' '}
                                        {order.paymentStatus === 'PAID' ? (
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Payée
                                            </span>
                                        ) : order.paymentStatus === 'REFUNDED' ? (
                                            <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Remboursée
                                            </span>
                                        ) : order.paymentStatus === 'FAILED' ? (
                                            <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Échoué
                                            </span>
                                        ) : (
                                            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> En attente
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

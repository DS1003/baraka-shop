'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Star,
    ExternalLink,
    ArrowUpDown,
    ShoppingBag,
    Trash2,
    Loader2,
    AlertCircle,
    Check,
    UserPlus,
    Activity,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminCustomers, deleteCustomer, createCustomer, updateCustomer } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSegment, setActiveSegment] = useState('all');
    const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);

    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [customerToDelete, setCustomerToDelete] = useState<any>(null);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAdminCustomers(searchQuery, activeSegment);
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadCustomers, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, activeSegment]);

    const handleExportCSV = () => {
        try {
            if (customers.length === 0) {
                toast.error("Aucun client à exporter.");
                return;
            }

            const exportData = customers.map(c => ({
                ID: c.id,
                Nom: c.username || 'N/A',
                Email: c.email,
                Téléphone: c.phone || 'N/A',
                Adresse: c.address || 'N/A',
                Commandes_Totales: c._count?.orders || 0,
                Date_Inscription: new Date(c.createdAt).toLocaleDateString('fr-FR'),
                VIP: c._count?.orders > 5 ? 'Oui' : 'Non'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Clients");
            XLSX.writeFile(wb, `baraka_clients_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success("Export CSV réussi !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export CSV.");
        }
    };

    const customersTotal = customers.length;
    const activeCount = customers.filter(c => c._count.orders > 0).length;

    return (
        <div className="space-y-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Gestion <span className="text-orange-600">Clients.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Analysez le comportement de vos clients et fidélisez votre audience.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} className="text-slate-400" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group">
                        <UserPlus size={18} />
                        <span>Ajouter un Client</span>
                    </button>
                </div>
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <InsightCard label="CLIENTS TOTAUX" value={customersTotal.toString()} trend="+0" icon={Users} color="orange" />
                <InsightCard label="CLIENTS ACTIFS" value={activeCount.toString()} trend="+0" icon={Activity} color="emerald" />
                <InsightCard label="VALEUR MOYENNE" value="N/A" trend="0" icon={ShoppingBag} color="violet" />
                <InsightCard label="FIDÉLITÉ" value="N/A" trend="0" icon={Star} color="amber" />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Chercher un nom, email, téléphone ou ville..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto relative">
                    <button
                        onClick={() => setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                        className={cn("flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white border rounded-xl font-bold text-[13px] transition-all shadow-sm", activeSegment !== 'all' ? "border-orange-500 text-orange-600 bg-orange-50/50" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                    >
                        <Filter size={18} className={activeSegment !== 'all' ? "text-orange-500" : "text-slate-400"} />
                        <span>Segments {activeSegment !== 'all' && '(1)'}</span>
                    </button>

                    <AnimatePresence>
                        {isSegmentMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSegmentMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden"
                                >
                                    {[
                                        { id: 'all', label: 'Tous les clients' },
                                        { id: 'vip', label: 'Clients VIP (>5 cmds)' },
                                        { id: 'active', label: 'Actifs (avec cmds)' },
                                        { id: 'inactive', label: 'Inactifs (0 cmds)' },
                                        { id: 'new', label: 'Nouveaux (30 jours)' }
                                    ].map(seg => (
                                        <button
                                            key={seg.id}
                                            onClick={() => {
                                                setActiveSegment(seg.id);
                                                setIsSegmentMenuOpen(false);
                                            }}
                                            className="w-full text-left px-5 py-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-between"
                                        >
                                            {seg.label}
                                            {activeSegment === seg.id && <Check size={16} className="text-orange-600" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Premium Customer Table */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des clients...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left">Profil Client</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Activité</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Email</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[13px] border border-orange-100/50 group-hover:scale-110 transition-transform shadow-sm">
                                                    {(customer.username || 'U').split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[15px] font-bold text-slate-900 leading-snug">{customer.username || 'Client Sans Nom'}</p>
                                                        {customer._count.orders > 5 && (
                                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">VIP</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[12px] text-slate-400 font-medium">Inscrit le {new Date(customer.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1.5 text-[12px] font-medium text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-300" /> {customer.phone || 'Non renseigné'}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-slate-300" /> {customer.address || 'Non renseignée'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[16px] font-black text-slate-900 leading-none">{customer._count.orders}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Commandes</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right text-[13px] text-slate-500 font-medium">
                                            {customer.email}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                <a href={`mailto:${customer.email}`} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200" title="Envoyer un email">
                                                    <Mail size={18} />
                                                </a>
                                                <button onClick={() => setEditingCustomer(customer)} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-orange-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200" title="Modifier">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => setCustomerToDelete(customer)} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200" title="Supprimer">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">Aucun client trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddCustomerModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={() => {
                            setIsAddModalOpen(false);
                            loadCustomers();
                            toast.success("Client ajouté avec succès.");
                        }}
                    />
                )}
                {editingCustomer && (
                    <EditCustomerModal
                        customer={editingCustomer}
                        onClose={() => setEditingCustomer(null)}
                        onSuccess={() => {
                            setEditingCustomer(null);
                            loadCustomers();
                            toast.success("Client modifié avec succès.");
                        }}
                    />
                )}
                {customerToDelete && (
                    <DeleteCustomerModal
                        customer={customerToDelete}
                        onClose={() => setCustomerToDelete(null)}
                        onSuccess={() => {
                            setCustomerToDelete(null);
                            loadCustomers();
                            toast.success("Client supprimé avec succès.");
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        address: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) {
            setError("Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe).");
            return;
        }

        setSubmitting(true);
        try {
            const res = await createCustomer(formData);
            if (res.success) {
                onSuccess();
            } else {
                setError(res.message || "Erreur lors de la création du client.");
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Ajouter un Client</h2>
                        <p className="text-sm text-slate-500 mt-1">Créez un nouveau profil utilisateur.</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600 border border-slate-100">
                        <UserPlus size={24} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex items-start gap-3 border border-rose-100">
                            <div className="mt-0.5"><Users size={16} /></div>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nom complet <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="ex: Amadou Fall"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email <span className="text-rose-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="amadou@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mot de passe <span className="text-rose-500">*</span></label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Téléphone</label>
                            <input
                                type="tel"
                                placeholder="+221 77 000 00 00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Adresse</label>
                            <input
                                type="text"
                                placeholder="Dakar, Sénégal"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <UserPlus size={18} />
                            )}
                            <span>{submitting ? 'Création...' : 'Créer le client'}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function EditCustomerModal({ customer, onClose, onSuccess }: { customer: any, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        username: customer.username || '',
        email: customer.email || '',
        phone: customer.phone || '',
        password: '',
        address: customer.address || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email) {
            setError("Veuillez remplir les champs obligatoires (Nom, Email).");
            return;
        }

        setSubmitting(true);
        try {
            const res = await updateCustomer(customer.id, formData);
            if (res.success) {
                onSuccess();
            } else {
                setError(res.message || "Erreur lors de la modification du client.");
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Modifier le Client</h2>
                        <p className="text-sm text-slate-500 mt-1">Mettez à jour les informations du profil.</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600 border border-slate-100">
                        <Edit2 size={24} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex items-start gap-3 border border-rose-100">
                            <div className="mt-0.5"><Users size={16} /></div>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nom complet <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="ex: Amadou Fall"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email <span className="text-rose-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="amadou@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mot de passe</label>
                                <input
                                    type="password"
                                    placeholder="•••••••• (inchangé)"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 ml-1">Laissez vide pour conserver l'actuel.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Téléphone</label>
                            <input
                                type="tel"
                                placeholder="+221 77 000 00 00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Adresse</label>
                            <input
                                type="text"
                                placeholder="Dakar, Sénégal"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Edit2 size={18} />
                            )}
                            <span>{submitting ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function DeleteCustomerModal({ customer, onClose, onSuccess }: { customer: any, onClose: () => void, onSuccess: () => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteClick = async () => {
        setError('');
        setSubmitting(true);
        try {
            const res = await deleteCustomer(customer.id);
            if (res.success) {
                onSuccess();
            } else {
                setError(res.message || "Impossible de supprimer ce client.");
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={!submitting ? onClose : undefined}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 flex items-center justify-center rounded-2xl mx-auto mb-6 border border-rose-100 shadow-sm">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Supprimer le client ?</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Êtes-vous sûr de vouloir supprimer <strong className="text-slate-800">{customer.username || customer.email}</strong> ? Cette action est irréversible.
                        <br /><span className="text-[13px] text-slate-400 mt-2 inline-block">(Si ce client a des commandes actives, la suppression sera refusée)</span>
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 text-left">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Trash2 size={18} />
                            )}
                            <span>{submitting ? 'Suppression...' : 'Oui, supprimer'}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function InsightCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) {
    const colorMap: any = {
        orange: "bg-orange-50 text-orange-600",
        emerald: "bg-emerald-50 text-emerald-600",
        violet: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] group relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", colorMap[color], "border-transparent group-hover:border-current/10")}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-500">
                    {trend}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-[30px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">{value}</h3>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors duration-1000 pointer-events-none" />
        </motion.div>
    );
}

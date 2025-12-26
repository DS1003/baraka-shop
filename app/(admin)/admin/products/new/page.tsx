'use client'

import { Upload, X } from 'lucide-react'

export default function NewProductPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Ajouter un produit</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold border-b border-border pb-2">Informations Générales</h3>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Nom du produit</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="Ex: MacBook Pro" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Description</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg bg-background h-32 resize-none" placeholder="Description détaillée..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Prix (FCFA)</label>
                            <input type="number" className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="0" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Stock</label>
                            <input type="number" className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Media & Category */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold border-b border-border pb-2 mb-4">Média</h3>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
                            <Upload className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm text-center">Glissez-déposez des images ou cliquez pour uploader</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {/* Preview placeholders */}
                            <div className="aspect-square bg-secondary rounded-lg border border-border relative">
                                <button className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold border-b border-border pb-2 mb-4">Organisation</h3>
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Catégorie</label>
                            <select className="w-full px-4 py-2 border rounded-lg bg-background">
                                <option>Sélectionner...</option>
                                <option>Ordinateurs</option>
                                <option>Smartphones</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <button className="btn btn-outline">Annuler</button>
                <button className="btn btn-primary px-8">Enregistrer le produit</button>
            </div>
        </div>
    )
}

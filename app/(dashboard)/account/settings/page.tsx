'use client'

import { Save, User } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Paramètres du compte</h2>

            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                        <User size={40} />
                    </div>
                    <button className="text-sm font-medium text-primary hover:underline">Changer la photo</button>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Prénom</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg bg-background" defaultValue="Mouhamed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg bg-background" defaultValue="Diop" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-2 border rounded-lg bg-background" defaultValue="mouhamed@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Téléphone</label>
                            <input type="tel" className="w-full px-4 py-2 border rounded-lg bg-background" defaultValue="+221 77 000 00 00" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Adresse de livraison</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg bg-background h-24 resize-none" defaultValue="123 Avenue Blaise Diagne, Dakar" />
                    </div>

                    <div className="pt-4 border-t border-border">
                        <h3 className="font-bold mb-4">Mot de passe</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                                <input type="password" className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                                <input type="password" className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button className="btn btn-primary px-6 py-2 rounded-lg flex items-center gap-2">
                            <Save size={18} /> Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock register
        router.push('/account')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <Link href="/" className="inline-block relative w-32 h-10 mb-6">
                        <Image
                            src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                            alt="Baraka Shop"
                            fill
                            className="object-contain"
                        />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900">Créer un compte</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Rejoignez la communauté Baraka Shop
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Prénom
                                </label>
                                <input
                                    id="first-name"
                                    name="first-name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Moussa"
                                />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom
                                </label>
                                <input
                                    id="last-name"
                                    name="last-name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Diop"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="vous@exemple.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                            J'accepte les <Link href="/terms" className="text-primary hover:underline">Conditions Générales</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-lg shadow-primary/30"
                    >
                        Créer mon compte
                    </button>
                </form>

                <p className="mt-2 text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-orange-600">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}

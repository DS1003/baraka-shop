'use client'

import ProductCard from '@/components/features/product/ProductCard'

// Same mock data as before roughly
const wishlistProducts = [
    {
        id: 1,
        name: 'Apple MacBook Pro M3',
        price: 1850000,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000',
        category: 'Ordinateurs',
        rating: 5,
        isHot: true
    },
    {
        id: 7,
        name: 'Canon EOS R6',
        price: 1600000,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
        category: 'Photo & Vidéo',
        rating: 5,
    },
]

export default function WishlistPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ma Wishlist ({wishlistProducts.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {wishlistProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Votre liste de souhaits est vide.</p>
                </div>
            )}
        </div>
    )
}

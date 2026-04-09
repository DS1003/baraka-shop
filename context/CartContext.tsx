'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    brand: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any, qty?: number) => void;
    removeFromCart: (id: string) => void;
    updateQty: (id: string, delta: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    // Ajouts pour l'optimisation
    lastAddedItem: CartItem | null;
    isToastVisible: boolean;
    showToast: (product: any) => void;
    hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    const [isToastVisible, setIsToastVisible] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('baraka-cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('baraka-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const showToast = (product: any) => {
        setLastAddedItem({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            image: product.image || (product.images && product.images[0]) || '/placeholder.png',
            brand: product.brand?.name || product.brand || 'Baraka'
        });
        setIsToastVisible(true);
    };

    const hideToast = () => setIsToastVisible(false);

    const addToCart = (product: any, qty: number = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + qty } : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                qty: qty,
                image: product.image || (product.images && product.images[0]) || '/placeholder.png',
                brand: product.brand?.name || product.brand || 'Baraka'
            }];
        });

        // Déclencher le toast
        showToast(product);
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const clearCart = () => setCartItems([]);

    const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart,
            itemCount,
            subtotal,
            lastAddedItem,
            isToastVisible,
            showToast,
            hideToast
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        // En cas de rendu côté serveur (SSR) ou s'il manque le Provider, 
        // on retourne un contexte factice pour éviter de faire planter l'application.
        return {
            cartItems: [],
            addToCart: () => { },
            removeFromCart: () => { },
            updateQty: () => { },
            clearCart: () => { },
            itemCount: 0,
            subtotal: 0,
            lastAddedItem: null,
            isToastVisible: false,
            showToast: () => { },
            hideToast: () => { },
        } as CartContextType;
    }
    return context;
}

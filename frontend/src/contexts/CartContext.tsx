'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    setCart(null);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setCart(data.payload.cart);
            } else {
                throw new Error(data.message || 'Failed to fetch cart');
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId, quantity = 1, variantId = null) => {
        if (!variantId) {
            console.error('Variant ID is required');
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/cart/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ productId, variantId, quantity })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCart(data.payload.cart);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            return false;
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const response = await fetch(`${API_URL}/cart/update`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'credentials': 'include'
                },
                credentials: 'include',
                body: JSON.stringify({ itemId, quantity })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCart(data.payload.cart);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update cart:', error);
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const response = await fetch(`${API_URL}/cart/remove`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'credentials': 'include'
                },
                credentials: 'include',
                body: JSON.stringify({ itemId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCart(data.payload.cart);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            return false;
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await fetch(`${API_URL}/cart/update`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'credentials': 'include'
                },
                credentials: 'include',
                body: JSON.stringify({ itemId, quantity: newQuantity })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCart(data.payload.cart);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update quantity:', error);
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const response = await fetch(`${API_URL}/cart/clear`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setCart(null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateCartItem,
            removeFromCart,
            updateQuantity,
            clearCart,
            refetchCart: fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CartItems from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CartPage() {
    const router = useRouter();
    const { cart, loading, refetchCart } = useCart();

    useEffect(() => {
        // Refetch cart data when navigating to the cart page
        refetchCart();
    }, []);

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <LoadingSpinner />
            </div>
        );
    }

    if (!cart?.items?.length) {
        return <EmptyCart />;
    }

    return (
        <div className="cart-container">
            <div className="cart-content">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <span className="item-count">
                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
                <div className="cart-grid">
                    <CartItems items={cart.items} />
                    <CartSummary cart={cart} />
                </div>
            </div>
        </div>
    );
}
